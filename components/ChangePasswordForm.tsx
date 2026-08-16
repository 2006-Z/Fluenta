"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";

export function ChangePasswordForm({ onSaved }: { onSaved?: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSaved?.();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm"
    >
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-foreground">Change password</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your current password and choose a new one.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Current password</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Lock size={16} className="text-muted" />
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">New password</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Lock size={16} className="text-muted" />
          <input
            required
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Confirm new password</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Lock size={16} className="text-muted" />
          <input
            required
            type="password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Update password
      </button>

      <p className="text-center text-sm text-muted">
        Forgot your current password?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Reset it by email
        </Link>
      </p>
    </form>
  );
}
