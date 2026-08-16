import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const { name, password } = parsed.data;

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
  if (!pending || !pending.verified || pending.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Please verify your email again" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.create({
      data: { email, name, passwordHash, emailVerified: true },
    }),
    prisma.pendingSignup.delete({ where: { email } }),
  ]);

  return NextResponse.json({ ok: true });
}
