"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Lock } from "lucide-react";
import { parseResearch, type ResearchSection } from "@/lib/parseResearch";
import { Markdown } from "@/components/Markdown";

const FREE_CHAR_LIMIT = 450;

function truncateSections(sections: ResearchSection[], limit: number) {
  const visible: ResearchSection[] = [];
  let used = 0;
  let truncated = false;

  for (const section of sections) {
    if (used >= limit) {
      truncated = true;
      break;
    }
    const remaining = limit - used;
    if (section.content.length <= remaining) {
      visible.push(section);
      used += section.content.length;
    } else {
      visible.push({
        title: section.title,
        content: section.content.slice(0, remaining).trimEnd() + "…",
      });
      used = limit;
      truncated = true;
    }
  }

  if (visible.length < sections.length) truncated = true;
  return { visible, truncated };
}

export function ResearchPanel({
  research,
  subscribed,
}: {
  research: string;
  subscribed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sections = parseResearch(research);
  const { visible: visibleSections, truncated: isTruncated } = subscribed
    ? { visible: sections, truncated: false }
    : truncateSections(sections, FREE_CHAR_LIMIT);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <FileText size={14} />
        Company research
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
                <div className="flex flex-col gap-4">
                  {visibleSections.map((section, i) => (
                    <div key={i}>
                      <h3 className="mb-1 text-sm font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <Markdown content={section.content} />
                    </div>
                  ))}
                </div>

                {isTruncated && (
                  <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-4 text-center">
                    <Lock size={18} className="text-accent" />
                    <p className="text-sm font-medium text-foreground">
                      Unlock the full briefing
                    </p>
                    <p className="text-xs text-muted">
                      Interview process, example questions, and more — with a
                      subscription.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
