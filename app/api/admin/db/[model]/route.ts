import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAuth";
import { ADMIN_MODELS, getDelegate } from "@/lib/adminModels";

const PAGE_SIZE = 25;

export async function GET(
  request: Request,
  context: { params: Promise<{ model: string }> }
) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { model: modelKey } = await context.params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) {
    return NextResponse.json({ error: "Unknown model" }, { status: 404 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

  const select = Object.fromEntries(
    model.fields.map((f) => [f.name, true])
  );

  const delegate = getDelegate(modelKey);
  const [rows, total] = await Promise.all([
    delegate.findMany({
      select,
      orderBy: { [model.orderBy.field]: model.orderBy.direction },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    delegate.count(),
  ]);

  return NextResponse.json({ rows, total, page, pageSize: PAGE_SIZE });
}
