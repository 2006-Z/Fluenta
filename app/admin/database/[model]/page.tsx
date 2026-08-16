import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { ADMIN_MODELS, getDelegate } from "@/lib/adminModels";

const PAGE_SIZE = 25;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = String(value);
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export default async function AdminModelListPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  const { model: modelKey } = await params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const select = Object.fromEntries(model.fields.map((f) => [f.name, true]));
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const columns = model.fields.map((f) => f.name).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Link
        href="/admin/database"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to database
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{model.label}</h1>
          <p className="text-muted">{total} total rows</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(
                (
                  row: Record<string, unknown> & { id: string }
                ) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover"
                  >
                    {columns.map((col, i) =>
                      i === 0 ? (
                        <td key={col} className="whitespace-nowrap px-4 py-3">
                          <Link
                            href={`/admin/database/${modelKey}/${row.id}`}
                            className="font-mono text-xs text-accent hover:text-accent-hover"
                          >
                            {formatCell(row[col])}
                          </Link>
                        </td>
                      ) : (
                        <td
                          key={col}
                          className="max-w-[220px] truncate whitespace-nowrap px-4 py-3 text-muted"
                        >
                          {formatCell(row[col])}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                    No rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href={`/admin/database/${modelKey}?page=${Math.max(1, page - 1)}`}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-hover"
            }`}
          >
            <ChevronLeft size={14} />
          </Link>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/database/${modelKey}?page=${Math.min(totalPages, page + 1)}`}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground ${
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-hover"
            }`}
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
