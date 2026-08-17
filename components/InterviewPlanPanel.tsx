"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function InterviewPlanPanel({
  steps,
  stepsDone,
}: {
  steps: string[];
  stepsDone: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ListChecks size={14} />
        Interview plan
        <span className="text-xs text-muted">
          {Math.min(stepsDone, steps.length)}/{steps.length}
        </span>
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
            <div className="mx-auto max-w-5xl px-4 pb-5">
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-2.5">
                  {steps.map((step, i) => {
                    const done = i < stepsDone;
                    const current = i === stepsDone;
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                            done
                              ? "border-success bg-success text-white"
                              : current
                                ? "border-accent text-accent"
                                : "border-border text-muted"
                          )}
                        >
                          {done ? <Check size={12} /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            done
                              ? "text-muted line-through"
                              : current
                                ? "font-medium text-foreground"
                                : "text-muted"
                          )}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
