import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.conversation.count({
    where: { userId: session.user.id },
  });

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: `Conversation ${count + 1}`,
      status: "pending",
    },
  });

  return NextResponse.json({ id: conversation.id });
}
