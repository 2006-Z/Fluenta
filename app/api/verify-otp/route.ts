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

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id, purpose: "signup" },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "That code is invalid or has expired" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.otpCode.deleteMany({ where: { userId: user.id, purpose: "signup" } }),
  ]);

  return NextResponse.json({ ok: true });
}
