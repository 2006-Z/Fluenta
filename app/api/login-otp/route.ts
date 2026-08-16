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

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.emailVerified) {
    await prisma.otpCode.deleteMany({ where: { userId: user.id, purpose: "login" } });

    const code = generateOtpCode();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: "login",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    const { error: emailError } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Your Fluenta login code",
      html: `
        <p>Your login code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    });
    if (emailError) {
      console.error("Failed to send login OTP email:", emailError);
      return NextResponse.json(
        { error: "Couldn't send login code — try again in a moment" },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
