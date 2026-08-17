"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import type { FieldDef } from "@/lib/adminModels";
import { humanizeFieldName } from "@/lib/utils";

type RowValue = string | number | boolean | null;

export function AdminDbRowEditForm({
  modelKey,
  fields,
  row,
}: {
  modelKey: string;
  fields: FieldDef[];
  row: Record<string, RowValue>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, RowValue>>(row);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function setField(name: string, value: RowValue) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const editable = fields.filter((f) => f.type !== "readonly");
      const body: Record<string, RowValue> = {};
      for (const f of editable) body[f.name] = values[f.name];

      const res = await fetch(`/api/admin/db/${modelKey}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success("Saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/db/${modelKey}/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      toast.success("Deleted");
      router.push(`/admin/database/${modelKey}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
      >
        {fields.map((field) => {
          const value = values[field.name];
          if (field.type === "readonly") {
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted">
                  {humanizeFieldName(field.name)}
                </span>
                <p className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted">
                  {value === null || value === undefined || value === ""
                    ? "—"
                    : String(value)}
                </p>
              </div>
            );
          }
          if (field.type === "boolean") {
            return (
              <label key={field.name} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => setField(field.name, e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                <span className="text-sm font-medium text-foreground">
                  {humanizeFieldName(field.name)}
                </span>
              </label>
            );
          }
          if (field.type === "textarea") {
            return (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  {humanizeFieldName(field.name)}
                </span>
                <textarea
                  rows={4}
                  value={value === null || value === undefined ? "" : String(value)}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </label>
            );
          }
          if (field.type === "int") {
            return (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  {humanizeFieldName(field.name)}
                </span>
                <input
                  type="number"
                  value={value === null || value === undefined ? "" : Number(value)}
                  onChange={(e) => setField(field.name, Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </label>
            );
          }
          return (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {humanizeFieldName(field.name)}
              </span>
              <input
                type="text"
                value={value === null || value === undefined ? "" : String(value)}
                onChange={(e) => setField(field.name, e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
          );
        })}

        <button
          type="submit"
          disabled={saving}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save changes
        </button>
      </form>

      <div className="flex flex-col gap-4 rounded-2xl border border-danger/30 bg-danger-bg p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger" />
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
        </div>
        <p className="text-sm text-muted">
          Permanently delete this row. Related rows may cascade-delete too.
        </p>

        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-danger/40 bg-background px-4 text-sm font-medium text-danger transition-colors hover:bg-danger-bg"
          >
            <Trash2 size={16} />
            Delete row
          </button>
        )}
      </div>
    </div>
  );
}
