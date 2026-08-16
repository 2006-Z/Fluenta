"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquareText, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Panel = "feedback" | "report" | null;

export function MessageActions({ messageId }: { messageId: string }) {
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  async function sendFeedback(body: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/messages/${messageId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Request failed");
    } catch {
      toast.error("Couldn't send feedback");
    }
  }

  async function handleRate(next: "good" | "bad") {
    const value = rating === next ? null : next;
    setRating(value);
    await sendFeedback({ rating: value });
  }

  async function handleSubmitPanel() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      if (panel === "feedback") {
        await sendFeedback({ comment: text.trim() });
        toast.success("Thanks for the feedback");
      } else if (panel === "report") {
        await sendFeedback({ reported: true, reportReason: text.trim() });
        toast.success("Reported — thanks for flagging this");
        setReported(true);
      }
      setText("");
      setPanel(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-1.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleRate("good")}
          aria-label="Good response"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground",
            rating === "good" && "bg-success-bg text-success"
          )}
        >
          <ThumbsUp size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleRate("bad")}
          aria-label="Bad response"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground",
            rating === "bad" && "bg-danger-bg text-danger"
          )}
        >
          <ThumbsDown size={13} />
        </button>
        <button
          type="button"
          onClick={() => setPanel((p) => (p === "feedback" ? null : "feedback"))}
          aria-label="Give feedback"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground",
            panel === "feedback" && "bg-surface-hover text-foreground"
          )}
        >
          <MessageSquareText size={13} />
        </button>
        <button
          type="button"
          onClick={() => setPanel((p) => (p === "report" ? null : "report"))}
          disabled={reported}
          aria-label="Report response"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-40",
            (panel === "report" || reported) && "bg-danger-bg text-danger"
          )}
        >
          <Flag size={13} />
        </button>
      </div>

      {panel && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitPanel()}
            placeholder={
              panel === "feedback"
                ? "What would make this better?"
                : "Why are you reporting this?"
            }
            className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button
            type="button"
            onClick={handleSubmitPanel}
            disabled={!text.trim() || submitting}
            className="h-7 shrink-0 rounded-md bg-accent px-2.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
