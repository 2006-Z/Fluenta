import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAuth";
import { listDomains } from "@/lib/vercel";

export async function GET(request: Request) {
  if (!(await requireAdminToken(request))) {
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
