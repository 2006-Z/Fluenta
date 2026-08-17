import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getInsightsConversation, insightsTitle } from "@/lib/chatInsights";
import { InterviewPlanPanel } from "@/components/InterviewPlanPanel";

export default async function ChatInsightsPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, conversation } = await getInsightsConversation(id);

  if (!session?.user?.id) redirect("/login");
  if (!conversation || conversation.userId !== session.user.id) notFound();
  if (conversation.status !== "ready" || conversation.plan.length === 0) notFound();

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
            <h1 className="text-sm font-semibold text-foreground">Interview plan</h1>
            <p className="text-xs text-muted">{insightsTitle(conversation)}</p>
          </div>
        </div>
      </div>
      <InterviewPlanPanel
        steps={conversation.plan}
        stepsDone={conversation.planStepsDone}
        defaultOpen
      />
    </div>
  );
}
