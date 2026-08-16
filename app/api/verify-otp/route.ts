import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const { code } = parsed.data;

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });

  if (!pending || pending.code !== code || pending.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "That code is invalid or has expired" },
      { status: 400 }
    );
  }

  await prisma.pendingSignup.update({
    where: { email },
    data: { verified: true },
  });

  return NextResponse.json({ ok: true });
}
