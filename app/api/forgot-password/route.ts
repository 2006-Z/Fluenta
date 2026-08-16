import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { generateResetToken } from "@/lib/tokens";
import { env } from "@/lib/env";

const schema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${env.NEXTAUTH_URL}/reset-password/${token}`;

    const { error: emailError } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Reset your Fluenta password",
      html: `
        <p>Hi ${user.name ?? "there"},</p>
        <p>Click the link below to reset your Fluenta password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
    if (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }
  }

  // Always return success to avoid revealing whether an email is registered.
  return NextResponse.json({ ok: true });
}
