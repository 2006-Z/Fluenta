import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResearchPanel } from "@/components/ResearchPanel";
import { InterviewPlanPanel } from "@/components/InterviewPlanPanel";
import { InterviewReportPanel } from "@/components/InterviewReportPanel";
import { LessonPanel } from "@/components/LessonPanel";

export default async function ChatInsightsPage({
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
        lessons: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  if (!session?.user?.id) redirect("/login");
  if (!conversation || conversation.userId !== session.user.id) notFound();

  const isReady = conversation.status === "ready";
  const title =
    isReady && conversation.company && conversation.role
      ? `${conversation.role} at ${conversation.company}`
      : conversation.title ?? "New interview";

  const hasResearch = isReady && Boolean(conversation.research);
  const hasPlan = isReady && conversation.plan.length > 0;
  const hasReport = Boolean(conversation.report);
  const hasLesson = Boolean(conversation.lessons[0]);
  const hasAny = hasResearch || hasPlan || hasReport || hasLesson;

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <Link
            href={`/chat/${id}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Back to conversation"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Interview insights</h1>
            <p className="text-xs text-muted">{title}</p>
          </div>
        </div>
      </div>

      {!hasAny && (
        <p className="mx-auto w-full max-w-5xl px-4 py-10 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      )}

      {hasResearch && (
        <ResearchPanel research={conversation.research!} subscribed={session.user.subscribed} />
      )}
      {hasPlan && (
        <InterviewPlanPanel steps={conversation.plan} stepsDone={conversation.planStepsDone} />
      )}
      {hasReport && (
        <InterviewReportPanel report={conversation.report!} verdict={conversation.reportVerdict} />
      )}
      {hasLesson && (
        <LessonPanel
          format={conversation.lessons[0].format}
          title={conversation.lessons[0].title}
          content={conversation.lessons[0].content}
        />
      )}
    </div>
  );
}
