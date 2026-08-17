"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ChevronDown } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

export function InterviewReportPanel({
  report,
  verdict,
  variant = "bar",
}: {
  report: string;
  verdict: string | null;
  variant?: "bar" | "inline";
}) {
  const [open, setOpen] = useState(true);
  const isStrong = verdict === "strong";
  const inline = variant === "inline";

  return (
    <div className={cn(!inline && "border-b border-border")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground",
          inline
            ? "w-full px-3 py-2.5"
            : "mx-auto w-full max-w-5xl px-4 py-2.5"
        )}
      >
        <ClipboardCheck size={14} />
        Interview report
        {verdict && (
          <span
            className={
              isStrong
                ? "rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success"
                : "rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
            }
          >
            {isStrong ? "Strong performance" : "Needs improvement"}
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="ml-auto"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={inline ? "px-3 pb-3" : "mx-auto max-w-5xl px-4 pb-5"}>
              <div
                className={cn(
                  "rounded-xl border border-border",
                  inline ? "bg-background p-3" : "bg-surface p-5"
                )}
              >
                <Markdown content={report} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
