import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { generateOtpCode } from "@/lib/otp";
import { env } from "@/lib/env";

const schema = z.object({ email: z.string().trim().email("Enter a valid email") });
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a valid email" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }

  const code = generateOtpCode();
  await prisma.pendingSignup.upsert({
    where: { email },
    update: { code, verified: false, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    create: { email, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  const { error: emailError } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Verify your Fluenta email",
    html: `
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
  if (emailError) {
    console.error("Failed to send signup OTP email:", emailError);
    return NextResponse.json(
      { error: "Couldn't send verification email — try again in a moment" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
