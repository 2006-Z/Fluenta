import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { ADMIN_MODELS, getDelegate } from "@/lib/adminModels";
import { AdminDbRowEditForm } from "@/components/AdminDbRowEditForm";

export default async function AdminModelRowPage({
  params,
}: {
  params: Promise<{ model: string; id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  const { model: modelKey, id } = await params;
  const model = ADMIN_MODELS[modelKey];
  if (!model) notFound();

  const select = Object.fromEntries(model.fields.map((f) => [f.name, true]));
  const delegate = getDelegate(modelKey);
  const row = await delegate.findUnique({ where: { id }, select });

  if (!row) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href={`/admin/database/${modelKey}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to {model.label}
      </Link>
      <h1 className="mb-6 break-all text-xl font-semibold text-foreground">
        {model.label} · {row.id}
      </h1>
      <AdminDbRowEditForm modelKey={modelKey} fields={model.fields} row={row} />
    </div>
  );
}
