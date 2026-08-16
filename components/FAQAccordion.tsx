"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is Fluenta free to use?",
    answer:
      "Yes — you can start practicing for free. A subscription unlocks unlimited interview practice and the full company research briefing.",
  },
  {
    question: "Which companies and roles does it support?",
    answer:
      "Any company and role you tell it — just type the company name and the job role you're interviewing for, and Fluenta researches that specific target before your mock interview.",
  },
  {
    question: "How does the AI correct my English in real time?",
    answer:
      "As you answer each question, Fluenta reviews your message for grammar, word choice, and phrasing issues and shows inline corrections with a short explanation, right alongside its feedback on your actual answer.",
  },
  {
    question: "Do I need to prepare anything beforehand?",
    answer:
      "No — just show up and tell Fluenta the company and role. You can optionally upload your resume or a job description so it asks more personalized questions.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div
            key={faq.question}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-foreground">{faq.question}</span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 text-muted"
              >
                <ChevronDown size={16} />
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
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
