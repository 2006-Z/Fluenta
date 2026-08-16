"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function NewConversationButton({ className }: { className?: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleClick() {
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to create conversation");
      router.push(`/chat/${data.id}`);
    } catch {
      toast.error("Couldn't start a new interview. Please try again.");
      setCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={creating}
      className={
        className ??
        "flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60"
      }
    >
      {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      New interview
    </button>
  );
}
