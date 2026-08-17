import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getInsightsConversation(id: string) {
  const [session, conversation] = await Promise.all([
    auth(),
    prisma.conversation.findUnique({
      where: { id },
      include: { lessons: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);
  return { session, conversation };
}

export function insightsTitle(conversation: {
  status: string;
  company: string | null;
  role: string | null;
  title: string | null;
}) {
  const isReady = conversation.status === "ready";
  return isReady && conversation.company && conversation.role
    ? `${conversation.role} at ${conversation.company}`
    : conversation.title ?? "New interview";
}
