"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export function DeleteAccountForm() {
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        setDeleting(false);
        return;
      }
      toast.success("Account deleted");
      signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Network error — please try again");
      setDeleting(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-danger/30 bg-danger-bg p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-danger" />
        <h2 className="text-sm font-semibold text-danger">Delete account</h2>
      </div>
      <p className="text-sm text-muted">
        This permanently deletes your account and all of your interview
        history. This cannot be undone.
      </p>

      {showConfirm ? (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Enter your password to confirm
            </span>
            <input
              required
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-danger"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={deleting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Permanently delete
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setPassword("");
              }}
              disabled={deleting}
              className="flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-danger/40 bg-background px-4 text-sm font-medium text-danger transition-colors hover:bg-danger-bg"
        >
          <Trash2 size={16} />
          Delete my account
        </button>
      )}
    </div>
  );
}
