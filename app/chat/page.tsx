import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewConversationButton } from "@/components/NewConversationButton";
import { stripMessageMarkers } from "@/lib/parseCorrections";

export default async function ChatHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Your interviews
          </h1>
          <p className="mt-1 text-muted">
            Resume a past session or start a new one.
          </p>
        </div>
        <NewConversationButton />
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-16 text-center">
          <MessagesSquare size={28} className="text-accent" />
          <p className="text-sm text-muted">
            You haven&apos;t started an interview yet.
          </p>
          <NewConversationButton />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[0];
            const title =
              conversation.company && conversation.role
                ? `${conversation.role} at ${conversation.company}`
                : conversation.title;
            return (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {conversation.company ? (
                      <Building2 size={15} className="shrink-0 text-accent" />
                    ) : (
                      <MessagesSquare size={15} className="shrink-0 text-muted" />
                    )}
                    <h2 className="font-medium text-foreground">{title}</h2>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {conversation.updatedAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {lastMessage && (
                  <p className="truncate text-sm text-muted">
                    {lastMessage.role === "user" ? "You: " : ""}
                    {stripMessageMarkers(lastMessage.content)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
