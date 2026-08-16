"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Languages } from "lucide-react";
import toast from "react-hot-toast";

export function ChangeLanguageForm({
  currentLanguage,
  onSaved,
}: {
  currentLanguage: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState(currentLanguage);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/account/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage: language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success("Feedback language updated");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Feedback language</h2>
        <p className="mt-1 text-sm text-muted">
          Choose the language for your answer-quality feedback. Your mock
          interview itself always stays in English.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Language</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Languages size={16} className="text-muted" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-background text-sm text-foreground outline-none"
          >
            <option value="English" className="bg-background text-foreground">
              English
            </option>
            <option value="Hindi" className="bg-background text-foreground">
              Hindi
            </option>
            <option value="Hinglish" className="bg-background text-foreground">
              Hinglish (Hindi + English mix)
            </option>
          </select>
        </div>
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || language === currentLanguage}
        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        Save
      </button>

      <p className="text-xs text-muted">
        You can also just tell your interviewer in chat — e.g. &quot;give
        feedback in Hindi&quot; — and it'll switch automatically.
      </p>
    </div>
  );
}
