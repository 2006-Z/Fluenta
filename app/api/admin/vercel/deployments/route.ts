import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminToken } from "@/lib/adminAuth";
import { listDeployments, redeployDeployment } from "@/lib/vercel";

export async function GET(request: Request) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const deployments = await listDeployments();
    return NextResponse.json({ deployments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load deployments" },
      { status: 502 }
    );
  }
}

const schema = z.object({ deploymentId: z.string().min(1) });

export async function POST(request: Request) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await redeployDeployment(parsed.data.deploymentId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Redeploy failed" },
      { status: 502 }
    );
  }
}
