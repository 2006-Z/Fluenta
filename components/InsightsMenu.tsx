"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRight } from "lucide-react";
import { ResearchPanel } from "@/components/ResearchPanel";
import { InterviewPlanPanel } from "@/components/InterviewPlanPanel";
import { InterviewReportPanel } from "@/components/InterviewReportPanel";
import { LessonPanel } from "@/components/LessonPanel";

export function InsightsMenu({
  research,
  subscribed,
  plan,
  planStepsDone,
  report,
  reportVerdict,
  lesson,
}: {
  research?: string | null;
  subscribed: boolean;
  plan?: string[];
  planStepsDone?: number;
  report?: string | null;
  reportVerdict?: string | null;
  lesson?: { format: string; title: string; content: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasPlan = Boolean(plan && plan.length > 0);
  const hasAny = Boolean(research || hasPlan || report || lesson);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasAny) return null;

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
            className="absolute right-0 top-10 z-50 max-h-[75vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg sm:w-96"
          >
            <div className="divide-y divide-border">
              {research && (
                <ResearchPanel
                  research={research}
                  subscribed={subscribed}
                  variant="inline"
                />
              )}
              {hasPlan && (
                <InterviewPlanPanel
                  steps={plan!}
                  stepsDone={planStepsDone ?? 0}
                  variant="inline"
                />
              )}
              {report && (
                <InterviewReportPanel
                  report={report}
                  verdict={reportVerdict ?? null}
                  variant="inline"
                />
              )}
              {lesson && (
                <LessonPanel
                  format={lesson.format}
                  title={lesson.title}
                  content={lesson.content}
                  variant="inline"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
