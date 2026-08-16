import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminToken } from "@/lib/adminAuth";
import { listEnvVars, createEnvVar } from "@/lib/vercel";

export async function GET(request: Request) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const envs = await listEnvVars();
    return NextResponse.json({
      envs: envs.map((e) => ({
        id: e.id,
        key: e.key,
        type: e.type,
        target: e.target,
        // Sensitive/encrypted values are never returned by the Vercel API —
        // only plaintext-type vars would include `value`.
        hasVisibleValue: typeof e.value === "string",
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load env vars" },
      { status: 502 }
    );
  }
}

const schema = z.object({
  key: z.string().trim().min(1),
  value: z.string().min(1),
  target: z.array(z.enum(["production", "preview", "development"])).min(1),
});

export async function POST(request: Request) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    await createEnvVar(parsed.data.key, parsed.data.value, parsed.data.target);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create env var" },
      { status: 502 }
    );
  }
}
