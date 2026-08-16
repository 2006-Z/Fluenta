import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { generateOtpCode } from "@/lib/otp";
import { env } from "@/lib/env";

const schema = z.object({ email: z.string().trim().email() });
const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await prisma.otpCode.deleteMany({ where: { userId: user.id, purpose: "signup" } });

    const code = generateOtpCode();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: "signup",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    const { error: emailError } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Your new Fluenta verification code",
      html: `
        <p>Your new verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 10 minutes.</p>
      `,
    });
    if (emailError) {
      console.error("Failed to resend OTP email:", emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
