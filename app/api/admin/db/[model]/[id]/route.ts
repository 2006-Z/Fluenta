import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_MODELS, getDelegate, editableFieldNames } from "@/lib/adminModels";

export async function GET(
  request: Request,
  context: { params: Promise<{ model: string; id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { model: modelKey, id } = await context.params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) {
    return NextResponse.json({ error: "Unknown model" }, { status: 404 });
  }

  const select = Object.fromEntries(model.fields.map((f) => [f.name, true]));
  const delegate = getDelegate(modelKey);
  const row = await delegate.findUnique({ where: { id }, select });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ row });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ model: string; id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { model: modelKey, id } = await context.params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) {
    return NextResponse.json({ error: "Unknown model" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const allowed = new Set(editableFieldNames(model));
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allowed.has(key)) data[key] = value;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const select = Object.fromEntries(model.fields.map((f) => [f.name, true]));
  const delegate = getDelegate(modelKey);

  try {
    const row = await delegate.update({ where: { id }, data, select });
    return NextResponse.json({ row });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ model: string; id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { model: modelKey, id } = await context.params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) {
    return NextResponse.json({ error: "Unknown model" }, { status: 404 });
  }

  const delegate = getDelegate(modelKey);
  try {
    await delegate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
