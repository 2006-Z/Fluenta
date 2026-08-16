import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  purpose: z.enum(["login", "signup"]),
});

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
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (parsed.data.purpose === "login") {
    if (!user || !user.emailVerified) {
      return NextResponse.json(
        { error: "No account found with that email" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  // purpose === "signup"
  if (user) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
