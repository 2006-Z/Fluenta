"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ChevronDown } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export function InterviewPlanPanel({ plan }: { plan: string }) {
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
                <Markdown content={plan} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
