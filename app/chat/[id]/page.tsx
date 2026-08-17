import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Briefcase, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInterviewGreeting } from "@/lib/interviewPrompt";
import { ChatWindow } from "@/components/ChatWindow";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { InsightsPopover, type InsightItem } from "@/components/InsightsPopover";

const ONBOARDING_GREETING =
  "Hi! I'm your AI interview coach. Tell me the company and role you're preparing for — for example, \"Verification Analyst at InstaVeritas\" — and I'll research it and get started.";

type InterviewRound = { name: string; type: string };

function asRounds(value: unknown): InterviewRound[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (r): r is InterviewRound =>
      typeof r === "object" && r !== null && "name" in r && "type" in r
  );
}

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, conversation] = await Promise.all([
    auth(),
    prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        attachments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, fileName: true, fileType: true },
        },
        lessons: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  if (!session?.user?.id) redirect("/login");
  if (!conversation || conversation.userId !== session.user.id) notFound();

  const isReady =
    conversation.status === "ready" ||
    conversation.status === "completed" ||
    conversation.status === "confirming";
  const greeting = isReady
    ? buildInterviewGreeting(conversation.company!, conversation.role!)
    : ONBOARDING_GREETING;
  const title =
    isReady && conversation.company && conversation.role
      ? `${conversation.role} at ${conversation.company}`
      : conversation.title ?? "New interview";

  const rounds = asRounds(conversation.rounds);
  const currentRoundType =
    conversation.status === "ready" ? rounds[Math.min(conversation.roundsDone, rounds.length - 1)]?.type ?? null : null;
  const progress =
    conversation.status === "ready" && conversation.estimatedTurns > 0
      ? Math.min(1, conversation.interviewTurnsDone / conversation.estimatedTurns)
      : null;

  const insightItems: InsightItem[] = [
    isReady && conversation.research && { key: "research" as const, label: "Company research" },
    conversation.report && { key: "report" as const, label: "Interview report" },
    conversation.lessons[0] && {
      key: "lesson" as const,
      label: `Lesson: ${conversation.lessons[0].title}`,
    },
  ].filter((x): x is InsightItem => Boolean(x));

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      <div className="border-b border-border px-4 py-2">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <Link
            href="/chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Back to your interviews"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {isReady ? (
                <Briefcase size={16} className="text-accent" />
              ) : (
                <Sparkles size={16} className="text-accent" />
              )}
              <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            </div>
            {progress !== null && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
          <InsightsPopover conversationId={id} items={insightItems} />
        </div>
      </div>
      <AttachmentsPanel attachments={conversation.attachments} />
      <ChatWindow
        conversationId={conversation.id}
        greeting={greeting}
        isReady={isReady}
        interviewerName={conversation.interviewerName}
        initialSummarizedUpToCount={conversation.summarizedUpToCount}
        initialInterviewTurnsDone={conversation.interviewTurnsDone}
        initialEstimatedTurns={conversation.estimatedTurns}
        initialCurrentRoundType={currentRoundType}
        initialMessages={conversation.messages.map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          isOnboarding: m.isOnboarding,
        }))}
      />
    </div>
  );
}
