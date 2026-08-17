import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject, type ModelMessage } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatModel } from "@/lib/ai";
import { buildInterviewSystemPrompt, type InterviewRound } from "@/lib/interviewPrompt";
import { researchCompanyRole } from "@/lib/research";
import { onboardingSchema, buildOnboardingSystemPrompt } from "@/lib/interviewOnboarding";
import { interviewReplySchema, formatInterviewReply } from "@/lib/interviewReply";
import { kickoffSchema } from "@/lib/interviewKickoff";
import { confirmIntentSchema, buildConfirmIntentSystemPrompt } from "@/lib/interviewConfirm";
import { summarizeConversation } from "@/lib/summarize";
import { generateInterviewReport } from "@/lib/interviewReport";
import { generateWrapupMessage } from "@/lib/interviewWrapup";
import { generateLesson } from "@/lib/lessons";
import { pickLessonFormat } from "@/lib/lessonFormats";
import { restartIntentSchema, buildRestartIntentSystemPrompt } from "@/lib/restartIntent";

export const runtime = "nodejs";

const HISTORY_LIMIT = 30;
const FREE_MESSAGE_LIMIT = 10;
const SUMMARY_TRIGGER = 25;

const chatRequestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000),
});

function asRounds(value: unknown): InterviewRound[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (r): r is InterviewRound =>
      typeof r === "object" && r !== null && "name" in r && "type" in r
  );
}

async function runKickoff({
  company,
  role,
  research,
  contextSummary,
  interviewerName,
  extraInstruction,
}: {
  company: string;
  role: string;
  research: string | null;
  contextSummary?: string | null;
  interviewerName?: string | null;
  extraInstruction: string;
}) {
  const kickoffSystemPrompt = buildInterviewSystemPrompt({
    company,
    role,
    research,
    contextSummary,
    interviewerName,
  });
  const { object } = await generateObject({
    model: chatModel,
    system: kickoffSystemPrompt,
    prompt: extraInstruction,
    schema: kickoffSchema,
  });
  return object;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, message } = parsed.data;
  const userId = session.user.id;

  const [user, conversation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { subscribed: true, preferredLanguage: true },
    }),
    prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { attachments: { select: { extractedText: true } } },
    }),
  ]);

  if (!conversation || conversation.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.message.create({
    data: { conversationId, role: "user", content: message },
  });

  const preferredLanguage = user?.preferredLanguage ?? "English";

  // Onboarding: no target set yet, so this message should be establishing one.
  // "confirming" and "completed" are handled separately below.
  if (
    conversation.status !== "ready" &&
    conversation.status !== "completed" &&
    conversation.status !== "confirming"
  ) {
    const onboardingHistory = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: -HISTORY_LIMIT,
    });
    const onboardingMessages: ModelMessage[] = onboardingHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    let onboarding;
    try {
      const result = await generateObject({
        model: chatModel,
        system: buildOnboardingSystemPrompt(preferredLanguage),
        messages: onboardingMessages,
        schema: onboardingSchema,
      });
      onboarding = result.object;
    } catch (error) {
      console.error("Onboarding failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    if (!onboarding.ready || !onboarding.company || !onboarding.role) {
      const created = await prisma.message.create({
        data: {
          conversationId,
          role: "assistant",
          content: onboarding.reply,
          isOnboarding: true,
        },
      });
      return NextResponse.json({
        reply: onboarding.reply,
        profileReady: false,
        messageId: created.id,
        isFluentaVoice: true,
      });
    }

    const { company, role } = onboarding;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        company,
        role,
        title: `${role} at ${company}`,
        status: "researching",
        research: null,
      },
    });

    let research: string | null = null;
    try {
      research = await researchCompanyRole(company, role);
    } catch (error) {
      console.error("Research failed:", error);
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { research, status: "confirming" },
    });

    try {
      const { object: confirmAsk } = await generateObject({
        model: chatModel,
        system: buildConfirmIntentSystemPrompt({ company, role, research, preferredLanguage }),
        prompt:
          "The research above was just completed. Ask whether the candidate already knows about the company and role, or would like you to walk them through it first.",
        schema: confirmIntentSchema,
      });

      if (confirmAsk.explainedResearch) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { researchExplainedBeforeInterview: true },
        });
      }

      const created = await prisma.message.create({
        data: { conversationId, role: "assistant", content: confirmAsk.reply, isOnboarding: true },
      });

      return NextResponse.json({
        reply: confirmAsk.reply,
        profileReady: true,
        messageId: created.id,
        isFluentaVoice: true,
      });
    } catch (error) {
      console.error("Confirm-ask failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }
  }

  // Research is done, waiting for the candidate to say they're ready to start.
  if (conversation.status === "confirming") {
    const recentHistory = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: -12,
    });
    const recentMessages: ModelMessage[] = recentHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    let intent;
    try {
      const result = await generateObject({
        model: chatModel,
        system: buildConfirmIntentSystemPrompt({
          company: conversation.company!,
          role: conversation.role!,
          research: conversation.research,
          preferredLanguage,
        }),
        messages: recentMessages,
        schema: confirmIntentSchema,
      });
      intent = result.object;
    } catch (error) {
      console.error("Confirm-intent check failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    if (intent.explainedResearch && !conversation.researchExplainedBeforeInterview) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { researchExplainedBeforeInterview: true },
      });
    }

    if (intent.wantsToStart !== true) {
      const created = await prisma.message.create({
        data: { conversationId, role: "assistant", content: intent.reply, isOnboarding: true },
      });
      return NextResponse.json({
        reply: intent.reply,
        profileReady: true,
        messageId: created.id,
        isFluentaVoice: true,
      });
    }

    try {
      const kickoff = await runKickoff({
        company: conversation.company!,
        role: conversation.role!,
        research: conversation.research,
        interviewerName: conversation.interviewerName,
        extraInstruction:
          "The candidate just confirmed they're ready to begin. Pick your interviewer name, design the rounds, estimate total turns, write your Fluenta intro message explaining the structure, and write the interviewer's opening greeting.",
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          status: "ready",
          interviewerName: kickoff.interviewerName,
          rounds: kickoff.rounds,
          roundsDone: 0,
          estimatedTurns: kickoff.estimatedTurns,
          interviewTurnsDone: 0,
        },
      });

      await prisma.message.create({
        data: { conversationId, role: "assistant", content: kickoff.introMessage, isOnboarding: true },
      });
      const created = await prisma.message.create({
        data: { conversationId, role: "assistant", content: kickoff.interviewerGreeting },
      });

      return NextResponse.json({
        reply: kickoff.interviewerGreeting,
        profileReady: true,
        messageId: created.id,
        interviewStarted: true,
        isFluentaVoice: false,
      });
    } catch (error) {
      console.error("Kickoff generation failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }
  }

  // Returning to a conversation whose interview already finished: don't
  // silently treat the new message as another interview answer. Figure out
  // whether the candidate wants to practice this same interview again, or
  // is asking about something else — restart only once that's clear.
  if (conversation.status === "completed") {
    const recentHistory = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: -12,
    });
    const recentMessages: ModelMessage[] = recentHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    let intent;
    try {
      const result = await generateObject({
        model: chatModel,
        system: buildRestartIntentSystemPrompt({
          company: conversation.company!,
          role: conversation.role!,
          hireProbability: conversation.hireProbability,
        }),
        messages: recentMessages,
        schema: restartIntentSchema,
      });
      intent = result.object;
    } catch (error) {
      console.error("Restart-intent check failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    if (intent.wantsToRestart === true) {
      try {
        const kickoff = await runKickoff({
          company: conversation.company!,
          role: conversation.role!,
          research: conversation.research,
          contextSummary: conversation.contextSummary,
          interviewerName: conversation.interviewerName,
          extraInstruction:
            "The candidate wants to practice this same interview again from the start. Pick your interviewer name (reuse the existing one given above if there is one), design fresh rounds, estimate total turns, write a Fluenta intro message that briefly acknowledges this is a new attempt while explaining the structure, and write the interviewer's opening greeting.",
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            status: "ready",
            completedAt: null,
            interviewerName: kickoff.interviewerName,
            rounds: kickoff.rounds,
            roundsDone: 0,
            estimatedTurns: kickoff.estimatedTurns,
            interviewTurnsDone: 0,
            companyGapDetected: false,
          },
        });

        await prisma.message.create({
          data: { conversationId, role: "assistant", content: kickoff.introMessage, isOnboarding: true },
        });
        const created = await prisma.message.create({
          data: { conversationId, role: "assistant", content: kickoff.interviewerGreeting },
        });

        return NextResponse.json({
          reply: kickoff.interviewerGreeting,
          profileReady: true,
          messageId: created.id,
          interviewComplete: false,
          interviewStarted: true,
          isFluentaVoice: false,
        });
      } catch (error) {
        console.error("Restart kickoff failed:", error);
        return NextResponse.json(
          { error: "The AI coach is unavailable right now. Please try again." },
          { status: 502 }
        );
      }
    }

    const created = await prisma.message.create({
      data: { conversationId, role: "assistant", content: intent.reply, isOnboarding: true },
    });

    return NextResponse.json({
      reply: intent.reply,
      profileReady: true,
      messageId: created.id,
      isFluentaVoice: true,
    });
  }

  // Ongoing interview: enforce the free-tier message limit.
  if (!user?.subscribed) {
    const userMessageCount = await prisma.message.count({
      where: { conversationId, role: "user" },
    });
    if (userMessageCount > FREE_MESSAGE_LIMIT) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message: "You've reached the free message limit for this session.",
        },
        { status: 402 }
      );
    }
  }

  // Rolling summarization: fold older messages into a running summary once
  // the raw window grows past SUMMARY_TRIGGER, so context (and cost) stays
  // bounded no matter how long the interview goes.
  let contextSummary = conversation.contextSummary;
  let summarizedUpToCount = conversation.summarizedUpToCount;

  const totalMessages = await prisma.message.count({ where: { conversationId } });
  const messagesSinceSummary = totalMessages - 1 - summarizedUpToCount;

  if (messagesSinceSummary >= SUMMARY_TRIGGER) {
    const toSummarize = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      skip: summarizedUpToCount,
      take: messagesSinceSummary,
    });
    try {
      contextSummary = await summarizeConversation({
        existingSummary: contextSummary,
        newMessages: toSummarize,
      });
      summarizedUpToCount += toSummarize.length;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { contextSummary, summarizedUpToCount },
      });
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  }

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    skip: summarizedUpToCount,
  });

  const messages: ModelMessage[] = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const attachmentsText = conversation.attachments
    .map((a) => a.extractedText)
    .filter((t): t is string => Boolean(t))
    .join("\n\n---\n\n");
  const combinedResumeText =
    [conversation.resumeText, attachmentsText].filter(Boolean).join("\n\n---\n\n") ||
    null;

  const rounds = asRounds(conversation.rounds);

  const systemPrompt = buildInterviewSystemPrompt({
    company: conversation.company!,
    role: conversation.role!,
    research: conversation.research,
    resumeText: combinedResumeText,
    structuredReply: true,
    preferredLanguage,
    interviewerName: conversation.interviewerName,
    contextSummary,
    rounds,
    currentRoundIndex: conversation.roundsDone,
  });

  try {
    const { object } = await generateObject({
      model: chatModel,
      system: systemPrompt,
      messages,
      schema: interviewReplySchema,
    });

    const { text: replyText, isFluentaVoice } = formatInterviewReply(object, {
      company: conversation.company!,
      role: conversation.role!,
    });

    if (
      object.languageChangeRequested &&
      object.languageChangeRequested !== user?.preferredLanguage
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLanguage: object.languageChangeRequested },
      });
    }

    const created = await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: replyText,
        isOnboarding: isFluentaVoice,
      },
    });

    // Every message advances progress, regardless of round/checklist state.
    const interviewTurnsDone = conversation.interviewTurnsDone + 1;
    const roundsDone = object.roundComplete
      ? Math.min(conversation.roundsDone + 1, Math.max(rounds.length - 1, 0))
      : conversation.roundsDone;
    const companyGapDetected = conversation.companyGapDetected || object.companyKnowledgeGapShown;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { interviewTurnsDone, roundsDone, companyGapDetected },
    });

    let interviewJustCompleted = false;
    if (object.interviewComplete && !conversation.completedAt) {
      interviewJustCompleted = true;
      try {
        const fullHistory = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: "asc" },
        });
        const reportMessages: ModelMessage[] = fullHistory.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));

        const report = await generateInterviewReport({
          company: conversation.company!,
          role: conversation.role!,
          messages: reportMessages,
        });
        const { formatReportMarkdown } = await import("@/lib/interviewReport");

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            status: "completed",
            completedAt: new Date(),
            report: formatReportMarkdown(report, conversation.company!, conversation.role!),
            hireProbability: report.hireProbability,
          },
        });

        if (report.lessonRecommended) {
          const usedLessons = await prisma.lesson.findMany({
            where: { conversation: { userId } },
            select: { format: true },
          });
          const formatId = pickLessonFormat(usedLessons.map((l) => l.format));
          const lesson = await generateLesson({
            formatId,
            company: conversation.company!,
            role: conversation.role!,
            report,
            messages: reportMessages,
          });
          await prisma.lesson.create({
            data: {
              conversationId,
              format: formatId,
              title: lesson.title,
              content: JSON.stringify(lesson.content),
            },
          });
        }

        const wrapupText = await generateWrapupMessage({
          company: conversation.company!,
          role: conversation.role!,
          report,
          includeResearchWalkthrough:
            !conversation.researchExplainedBeforeInterview && companyGapDetected,
          research: conversation.research,
          preferredLanguage,
        });
        await prisma.message.create({
          data: { conversationId, role: "assistant", content: wrapupText, isOnboarding: true },
        });
      } catch (error) {
        console.error("Report/lesson/wrapup generation failed:", error);
      }
    }

    return NextResponse.json({
      reply: replyText,
      profileReady: true,
      messageId: created.id,
      summarizedUpToCount,
      interviewComplete: interviewJustCompleted,
      interviewTurnsDone,
      estimatedTurns: conversation.estimatedTurns,
      currentRoundType: rounds[Math.min(roundsDone, rounds.length - 1)]?.type ?? null,
      isFluentaVoice,
    });
  } catch (error) {
    console.error("Chat completion failed:", error);
    return NextResponse.json(
      { error: "The AI coach is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
