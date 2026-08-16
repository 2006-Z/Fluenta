"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  RotateCw,
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

type Deployment = {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: string;
  target: string | null;
  meta?: { githubCommitMessage?: string; githubCommitSha?: string };
};

type EnvVar = {
  id: string;
  key: string;
  type: string;
  target: string[];
  hasVisibleValue: boolean;
};

type Domain = { name: string; verified: boolean; createdAt?: number };

const cardClass = "rounded-2xl border border-border bg-surface p-6";
const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent";

function stateBadgeClass(state: string) {
  if (state === "READY") return "bg-success-bg text-success";
  if (state === "ERROR") return "bg-danger-bg text-danger";
  return "bg-surface-hover text-muted";
}

export function AdminDeploymentsView() {
  const [notConfigured, setNotConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [redeployingId, setRedeployingId] = useState<string | null>(null);

  const [envs, setEnvs] = useState<EnvVar[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);

  const [showNewEnv, setShowNewEnv] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [savingNewEnv, setSavingNewEnv] = useState(false);

  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEditEnv, setSavingEditEnv] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vercel/overview");
      const data = await res.json();

      if (!res.ok && data.error?.includes("VERCEL_TOKEN")) {
        setNotConfigured(true);
      } else {
        setNotConfigured(false);
      }

      if (res.ok) {
        setDeployments(data.deployments ?? []);
        setEnvs(data.envs ?? []);
        setDomains(data.domains ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRedeploy(uid: string) {
    setRedeployingId(uid);
    try {
      const res = await fetch("/api/admin/vercel/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentId: uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Redeploy failed");
      toast.success("Redeploy triggered");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Redeploy failed");
    } finally {
      setRedeployingId(null);
    }
  }

  async function handleCreateEnv(e: React.FormEvent) {
    e.preventDefault();
    setSavingNewEnv(true);
    try {
      const res = await fetch("/api/admin/vercel/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          target: ["production", "preview", "development"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      toast.success("Environment variable added");
      setNewKey("");
      setNewValue("");
      setShowNewEnv(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSavingNewEnv(false);
    }
  }

  async function handleSaveEnvEdit(id: string) {
    setSavingEditEnv(true);
    try {
      const res = await fetch(`/api/admin/vercel/env/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success("Updated — redeploy to apply");
      setEditingEnvId(null);
      setEditValue("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingEditEnv(false);
    }
  }

  async function handleDeleteEnv(id: string, key: string) {
    if (!confirm(`Delete environment variable "${key}"?`)) return;
    try {
      const res = await fetch(`/api/admin/vercel/env/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (notConfigured) {
    return (
      <div className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-foreground">
          Vercel isn&apos;t connected yet
        </h2>
        <p className="text-sm text-muted">
          Add a <span className="font-mono">VERCEL_TOKEN</span> environment variable
          (a personal token from{" "}
          <span className="font-mono">vercel.com/account/tokens</span>) to enable
          deployments, environment variables, and domains here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Deployments</h2>
        <div className="flex flex-col gap-2">
          {deployments.map((d) => (
            <div
              key={d.uid}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateBadgeClass(
                      d.state
                    )}`}
                  >
                    {d.state}
                  </span>
                  {d.target && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {d.target}
                    </span>
                  )}
                  <span className="truncate text-sm text-foreground">
                    {d.meta?.githubCommitMessage ?? d.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(d.created).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`https://${d.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-hover hover:text-foreground"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => handleRedeploy(d.uid)}
                  disabled={redeployingId === d.uid}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground hover:bg-surface-hover disabled:opacity-60"
                >
                  {redeployingId === d.uid ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCw size={12} />
                  )}
                  Redeploy
                </button>
              </div>
            </div>
          ))}
          {deployments.length === 0 && (
            <p className="py-4 text-center text-sm text-muted">No deployments found</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Environment Variables
          </h2>
          <button
            type="button"
            onClick={() => setShowNewEnv((s) => !s)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground hover:bg-surface-hover"
          >
            <Plus size={12} />
            New
          </button>
        </div>

        {showNewEnv && (
          <form
            onSubmit={handleCreateEnv}
            className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-background p-4"
          >
            <input
              required
              placeholder="KEY"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className={inputClass}
            />
            <input
              required
              placeholder="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingNewEnv}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover px-3 text-xs font-medium text-accent-foreground disabled:opacity-60"
              >
                {savingNewEnv && <Loader2 size={12} className="animate-spin" />}
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewEnv(false)}
                className="flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-2">
          {envs.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">{e.key}</span>
                  <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-muted">
                    {e.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{e.target.join(", ")}</p>
                {editingEnvId === e.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      placeholder="New value"
                      value={editValue}
                      onChange={(ev) => setEditValue(ev.target.value)}
                      className={`flex-1 ${inputClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEnvEdit(e.id)}
                      disabled={savingEditEnv || !editValue}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground disabled:opacity-60"
                    >
                      {savingEditEnv ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEnvId(null);
                        setEditValue("");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-hover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEnvId(e.id);
                    setEditValue("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-hover hover:text-foreground"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEnv(e.id, e.key)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/40 text-danger hover:bg-danger-bg"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {envs.length === 0 && (
            <p className="py-4 text-center text-sm text-muted">No environment variables</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Domains</h2>
        <div className="flex flex-col gap-2">
          {domains.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
            >
              <span className="text-sm text-foreground">{d.name}</span>
              <span
                className={
                  d.verified
                    ? "rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success"
                    : "rounded-full bg-danger-bg px-2 py-0.5 text-xs font-medium text-danger"
                }
              >
                {d.verified ? "Verified" : "Not verified"}
              </span>
            </div>
          ))}
          {domains.length === 0 && (
            <p className="py-4 text-center text-sm text-muted">No domains</p>
          )}
        </div>
      </div>
    </div>
  );
}
