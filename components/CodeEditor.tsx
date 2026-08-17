"use client";

import { useState } from "react";
import { Code2, Send } from "lucide-react";

export function CodeEditor({
  onSubmit,
  disabled,
}: {
  onSubmit: (code: string) => void;
  disabled?: boolean;
}) {
  const [code, setCode] = useState("");

  function handleSubmit() {
    const trimmed = code.trim();
    if (!trimmed || disabled) return;
    onSubmit(`\`\`\`\n${trimmed}\n\`\`\``);
    setCode("");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 pb-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Code2 size={13} />
        Coding area — write your answer here
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Type your code here…"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        rows={8}
        className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!code.trim() || disabled}
        className="flex h-9 items-center justify-center gap-2 self-end rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 text-sm font-medium text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:brightness-110 disabled:opacity-40"
      >
        <Send size={14} />
        Submit code
      </button>
    </div>
  );
}
