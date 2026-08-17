import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getInsightsConversation, insightsTitle } from "@/lib/chatInsights";
import { ResearchPanel } from "@/components/ResearchPanel";

export default async function ChatInsightsResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, conversation } = await getInsightsConversation(id);

  if (!session?.user?.id) redirect("/login");
  if (!conversation || conversation.userId !== session.user.id) notFound();
  if (conversation.status !== "ready" || !conversation.research) notFound();

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <Link
            href={`/chat/${id}/insights`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Back to insights"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Company research</h1>
            <p className="text-xs text-muted">{insightsTitle(conversation)}</p>
          </div>
        </div>
      </div>
      <ResearchPanel
        research={conversation.research}
        subscribed={session.user.subscribed}
        defaultOpen
      />
    </div>
  );
}
