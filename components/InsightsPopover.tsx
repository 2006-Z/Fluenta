"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListChecks,
  PanelRight,
} from "lucide-react";

const ICONS = {
  research: FileText,
  plan: ListChecks,
  report: ClipboardCheck,
  lesson: GraduationCap,
} as const;

export type InsightItem = {
  key: keyof typeof ICONS;
  label: string;
};

export function InsightsPopover({
  conversationId,
  items,
}: {
  conversationId: string;
  items: InsightItem[];
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Interview insights"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <PanelRight size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-10 z-50 w-64 overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-lg"
          >
            {items.map(({ key, label }) => {
              const Icon = ICONS[key];
              return (
                <Link
                  key={key}
                  href={`/chat/${conversationId}/insights/${key}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  <Icon size={15} className="shrink-0 text-accent" />
                  <span className="flex-1 truncate">{label}</span>
                  <ChevronRight size={14} className="shrink-0 text-muted" />
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
