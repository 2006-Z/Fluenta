"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function CorrectionCard({
  wrong,
  fix,
  why,
}: {
  wrong: string;
  fix: string;
  why: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="my-1 inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-background px-3 py-2 align-top text-sm">
      <span className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-danger line-through decoration-2">{wrong}</span>
          <span className="text-muted">→</span>
          <span className="font-medium text-success">{fix}</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs text-muted transition-colors hover:bg-surface-hover"
          aria-label="Toggle explanation"
        >
          why
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronDown size={12} />
          </motion.span>
        </button>
      </span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block overflow-hidden text-xs text-muted"
          >
            {why}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
