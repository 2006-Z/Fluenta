import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { generateOtpCode } from "@/lib/otp";
import { env } from "@/lib/env";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
    .transform((v) => v.toLowerCase()),
  name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferredLanguage: z.enum(["English", "Hindi", "Hinglish"]).default("English"),
});

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { username, name, email, password, preferredLanguage } = parsed.data;

  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingUsername) {
    return NextResponse.json(
      { error: "Username is already taken" },
      { status: 409 }
    );
  }
  if (existingEmail) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, name, email, passwordHash, preferredLanguage, emailVerified: false },
  });

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
    subject: "Verify your Fluenta email",
    html: `
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
  if (emailError) {
    console.error("Failed to send signup OTP email:", emailError);
  }

  return NextResponse.json({ ok: true, requiresVerification: true }, { status: 201 });
}
