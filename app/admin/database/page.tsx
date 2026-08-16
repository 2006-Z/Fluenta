import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database } from "lucide-react";
import { auth } from "@/lib/auth";
import { ADMIN_MODELS, getDelegate } from "@/lib/adminModels";

export default async function AdminDatabasePage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  const entries = Object.values(ADMIN_MODELS);
  const counts = await Promise.all(
    entries.map((model) => getDelegate(model.key).count())
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to admin
      </Link>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Database</h1>
      <p className="mb-8 text-muted">
        Browse, edit, and delete rows directly — the same data you&apos;d see in
        Prisma Studio.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((model, i) => (
          <Link
            key={model.key}
            href={`/admin/database/${model.key}`}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Database size={18} />
              </div>
              <span className="font-medium text-foreground">{model.label}</span>
            </div>
            <span className="text-sm text-muted">{counts[i]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
