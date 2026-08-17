import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { getInsightsConversation, insightsTitle } from "@/lib/chatInsights";

export default async function ChatInsightsIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, conversation } = await getInsightsConversation(id);

  if (!session?.user?.id) redirect("/login");
  if (!conversation || conversation.userId !== session.user.id) notFound();

  const isReady = conversation.status === "ready";
  const title = insightsTitle(conversation);

  const items = [
    isReady &&
      conversation.research && {
        key: "research",
        label: "Company research",
        icon: FileText,
      },
    isReady &&
      conversation.plan.length > 0 && {
        key: "plan",
        label: "Interview plan",
        icon: ListChecks,
      },
    conversation.report && {
      key: "report",
      label: "Interview report",
      icon: ClipboardCheck,
    },
    conversation.lessons[0] && {
      key: "lesson",
      label: `Lesson: ${conversation.lessons[0].title}`,
      icon: GraduationCap,
    },
  ].filter(Boolean) as { key: string; label: string; icon: typeof FileText }[];

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

      {items.length === 0 ? (
        <p className="mx-auto w-full max-w-5xl px-4 py-10 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-col divide-y divide-border px-4">
          {items.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/chat/${id}/insights/${key}`}
              className="flex items-center gap-3 py-4 text-sm text-foreground transition-colors hover:text-accent"
            >
              <Icon size={16} className="shrink-0 text-accent" />
              <span className="flex-1 truncate">{label}</span>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
