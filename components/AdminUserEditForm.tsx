"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, KeyRound, Crown, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type UserData = {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  subscribed: boolean;
};

export function AdminUserEditForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [subscribed, setSubscribed] = useState(user.subscribed);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function updateUser(body: Record<string, string | boolean>) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
    return data;
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUser({ name, username, email });
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await updateUser({ password: newPassword });
      toast.success("Password updated");
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      toast.success("User deleted");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  async function toggleSubscribed() {
    const next = !subscribed;
    setSavingSubscription(true);
    try {
      await updateUser({ subscribed: next });
      setSubscribed(next);
      toast.success(next ? "User is now subscribed" : "Subscription removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingSubscription(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <div
            className={
              subscribed
                ? "flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success"
                : "flex h-10 w-10 items-center justify-center rounded-xl bg-surface-hover text-muted"
            }
          >
            <Crown size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {subscribed ? "Subscribed" : "Free tier"}
            </p>
            <p className="text-xs text-muted">
              {subscribed
                ? "Full research + unlimited chat"
                : "Limited research preview + 10 messages/session"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleSubscribed}
          disabled={savingSubscription}
          className={
            subscribed
              ? "flex h-9 items-center rounded-full bg-success px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              : "flex h-9 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-60"
          }
        >
          {savingSubscription && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          {subscribed ? "Remove subscription" : "Grant subscription"}
        </button>
      </div>

      <form
        onSubmit={handleProfileSave}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Username</span>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <span className="text-muted">@</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="No email on file"
          />
        </label>

        <button
          type="submit"
          disabled={savingProfile}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60"
        >
          {savingProfile ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save profile
        </button>
      </form>

      <form
        onSubmit={handlePasswordReset}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Reset password</h2>
        <p className="text-sm text-muted">
          The current password can&apos;t be viewed — it&apos;s stored securely
          and can only be replaced with a new one.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">New password</span>
          <input
            required
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>

        <button
          type="submit"
          disabled={savingPassword || newPassword.length < 6}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-60"
        >
          {savingPassword ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          Set new password
        </button>
      </form>

      <div className="flex flex-col gap-4 rounded-2xl border border-danger/30 bg-danger-bg p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger" />
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
        </div>
        <p className="text-sm text-muted">
          Permanently delete this user and all of their conversations and
          messages. This cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Type <span className="font-mono">{user.username}</span> to confirm
              </span>
              <input
                autoFocus
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-danger"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmUsername !== user.username}
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
                  setShowDeleteConfirm(false);
                  setConfirmUsername("");
                }}
                disabled={deleting}
                className="flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-danger/40 bg-background px-4 text-sm font-medium text-danger transition-colors hover:bg-danger-bg"
          >
            <Trash2 size={16} />
            Delete user
          </button>
        )}
      </div>
    </div>
  );
}
