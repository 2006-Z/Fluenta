import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Briefcase, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInterviewGreeting } from "@/lib/interviewPrompt";
import { ChatWindow } from "@/components/ChatWindow";
import { ResearchPanel } from "@/components/ResearchPanel";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { InterviewPlanPanel } from "@/components/InterviewPlanPanel";
import { InterviewReportPanel } from "@/components/InterviewReportPanel";
import { LessonPanel } from "@/components/LessonPanel";

const ONBOARDING_GREETING =
  "Hi! I'm your AI interview coach. Tell me the company and role you're preparing for — for example, \"Verification Analyst at InstaVeritas\" — and I'll research it and get started.";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      attachments: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fileName: true, fileType: true },
      },
      lessons: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!conversation || conversation.userId !== session.user.id) notFound();

  const isReady = conversation.status === "ready";
  const greeting = isReady
    ? buildInterviewGreeting(conversation.company!, conversation.role!)
    : ONBOARDING_GREETING;
  const title =
    isReady && conversation.company && conversation.role
      ? `${conversation.role} at ${conversation.company}`
      : conversation.title ?? "New interview";

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <Link
            href="/chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Back to your interviews"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex flex-1 items-center gap-2">
            {isReady ? (
              <Briefcase size={16} className="text-accent" />
            ) : (
              <Sparkles size={16} className="text-accent" />
            )}
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          </div>
        </div>
      </div>
      {isReady && conversation.research && (
        <ResearchPanel
          research={conversation.research}
          subscribed={session.user.subscribed}
        />
      )}
      {isReady && conversation.plan && (
        <InterviewPlanPanel plan={conversation.plan} />
      )}
      {conversation.report && (
        <InterviewReportPanel
          report={conversation.report}
          verdict={conversation.reportVerdict}
        />
      )}
      {conversation.lessons[0] && (
        <LessonPanel
          format={conversation.lessons[0].format}
          title={conversation.lessons[0].title}
          content={conversation.lessons[0].content}
        />
      )}
      <AttachmentsPanel attachments={conversation.attachments} />
      <ChatWindow
        conversationId={conversation.id}
        greeting={greeting}
        isReady={isReady}
        interviewerName={conversation.interviewerName}
        initialSummarizedUpToCount={conversation.summarizedUpToCount}
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
