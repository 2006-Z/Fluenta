import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listDomains } from "@/lib/vercel";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const domains = await listDomains();
    return NextResponse.json({ domains });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load domains" },
      { status: 502 }
    );
  }
}
