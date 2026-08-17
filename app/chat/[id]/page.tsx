import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Briefcase, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInterviewGreeting } from "@/lib/interviewPrompt";
import { ChatWindow } from "@/components/ChatWindow";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { InsightsMenu } from "@/components/InsightsMenu";
import { cn } from "@/lib/utils";

const ONBOARDING_GREETING =
  "Hi! I'm your AI interview coach. Tell me the company and role you're preparing for — for example, \"Verification Analyst at InstaVeritas\" — and I'll research it and get started.";

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

  const isReady = conversation.status === "ready";
  const greeting = isReady
    ? buildInterviewGreeting(conversation.company!, conversation.role!)
    : ONBOARDING_GREETING;
  const title =
    isReady && conversation.company && conversation.role
      ? `${conversation.role} at ${conversation.company}`
      : conversation.title ?? "New interview";

  const planTotal = conversation.plan.length;

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
            {isReady && planTotal > 0 && (
              <div className="flex w-full gap-1">
                {conversation.plan.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-500",
                      i < conversation.planStepsDone ? "bg-success" : "bg-border"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          <InsightsMenu
            research={isReady ? conversation.research : null}
            subscribed={session.user.subscribed}
            plan={isReady ? conversation.plan : undefined}
            planStepsDone={conversation.planStepsDone}
            report={conversation.report}
            reportVerdict={conversation.reportVerdict}
            lesson={conversation.lessons[0] ?? null}
          />
        </div>
      </div>
      <AttachmentsPanel attachments={conversation.attachments} />
      <ChatWindow
        conversationId={conversation.id}
        greeting={greeting}
        isReady={isReady}
        interviewerName={conversation.interviewerName}
        initialSummarizedUpToCount={conversation.summarizedUpToCount}
        initialPlanStepsDone={conversation.planStepsDone}
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
