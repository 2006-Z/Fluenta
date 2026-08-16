import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject, type ModelMessage } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatModel } from "@/lib/ai";
import { buildInterviewSystemPrompt } from "@/lib/interviewPrompt";
import { researchCompanyRole } from "@/lib/research";
import { onboardingSchema, ONBOARDING_SYSTEM_PROMPT } from "@/lib/interviewOnboarding";
import { interviewReplySchema, formatInterviewReply } from "@/lib/interviewReply";
import { kickoffSchema } from "@/lib/interviewKickoff";
import { summarizeConversation } from "@/lib/summarize";
import { generateInterviewReport } from "@/lib/interviewReport";
import { generateLesson } from "@/lib/lessons";
import { pickLessonFormat } from "@/lib/lessonFormats";

export const runtime = "nodejs";

const HISTORY_LIMIT = 30;
const FREE_MESSAGE_LIMIT = 10;
const SUMMARY_TRIGGER = 25;

const chatRequestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000),
});

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

  // Onboarding: no target set yet, so this message should be establishing one.
  if (conversation.status !== "ready") {
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
        system: ONBOARDING_SYSTEM_PROMPT,
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
      data: { research, status: "ready" },
    });

    const kickoffSystemPrompt = buildInterviewSystemPrompt({
      company,
      role,
      research,
    });

    try {
      const { object: kickoff } = await generateObject({
        model: chatModel,
        system: kickoffSystemPrompt,
        prompt:
          "The candidate has just confirmed the role and company. Pick your interviewer name, write your opening greeting, and write the short interview plan.",
        schema: kickoffSchema,
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { interviewerName: kickoff.interviewerName, plan: kickoff.plan },
      });

      const created = await prisma.message.create({
        data: { conversationId, role: "assistant", content: kickoff.greeting },
      });

      return NextResponse.json({
        reply: kickoff.greeting,
        profileReady: true,
        messageId: created.id,
        planReady: Boolean(kickoff.plan),
      });
    } catch (error) {
      console.error("Kickoff generation failed:", error);
      return NextResponse.json(
        { error: "The AI coach is unavailable right now. Please try again." },
        { status: 502 }
      );
    }
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

  const systemPrompt = buildInterviewSystemPrompt({
    company: conversation.company!,
    role: conversation.role!,
    jobDescription: conversation.jobDescription,
    research: conversation.research,
    resumeText: combinedResumeText,
    structuredReply: true,
    preferredLanguage: user?.preferredLanguage,
    interviewerName: conversation.interviewerName,
    contextSummary,
  });

  try {
    const { object } = await generateObject({
      model: chatModel,
      system: systemPrompt,
      messages,
      schema: interviewReplySchema,
    });

    const replyText = formatInterviewReply(object, {
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
      data: { conversationId, role: "assistant", content: replyText },
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
            completedAt: new Date(),
            report: formatReportMarkdown(report, conversation.company!, conversation.role!),
            reportVerdict: report.overallVerdict,
          },
        });

        if (report.overallVerdict === "needs-improvement") {
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
      } catch (error) {
        console.error("Report/lesson generation failed:", error);
      }
    }

    return NextResponse.json({
      reply: replyText,
      profileReady: true,
      messageId: created.id,
      summarizedUpToCount,
      interviewComplete: interviewJustCompleted,
    });
  } catch (error) {
    console.error("Chat completion failed:", error);
    return NextResponse.json(
      { error: "The AI coach is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
