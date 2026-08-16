import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.enum(["good", "bad"]).nullable().optional(),
  comment: z.string().max(1000).nullable().optional(),
  reported: z.boolean().optional(),
  reportReason: z.string().max(500).nullable().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: messageId } = await context.params;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { conversation: { select: { userId: true } } },
  });

  if (!message || message.conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const feedback = await prisma.messageFeedback.upsert({
    where: { messageId },
    create: {
      messageId,
      rating: data.rating ?? undefined,
      comment: data.comment ?? undefined,
      reported: data.reported ?? false,
      reportReason: data.reportReason ?? undefined,
    },
    update: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment }),
      ...(data.reported !== undefined && { reported: data.reported }),
      ...(data.reportReason !== undefined && { reportReason: data.reportReason }),
    },
  });

  return NextResponse.json({ feedback });
}
