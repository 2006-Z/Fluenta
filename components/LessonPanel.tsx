"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ChevronDown,
  Check,
  X,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Flashcards = { cards: { front: string; back: string }[] };
type BeforeAfter = { items: { before: string; after: string; why: string }[] };
type Quiz = {
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};
type StarMethod = {
  explanation: string;
  situation: string;
  task: string;
  action: string;
  result: string;
};
type Vocabulary = { terms: { term: string; meaning: string; example: string }[] };
type MistakePatterns = {
  patterns: { pattern: string; examples: string[]; fix: string }[];
};
type Checklist = { items: string[] };
type MiniArticle = { title: string; sections: { heading: string; body: string }[] };
type RoleplayRedo = {
  items: { question: string; yourAnswer: string; strongerAnswer: string }[];
};
type SpacedDrill = { prompts: { prompt: string; outline: string }[] };

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="flex min-h-[110px] flex-col items-start justify-center gap-2 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-surface-hover"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
        <RotateCw size={11} />
        {flipped ? "Answer" : "Prompt"}
      </span>
      <p className="text-sm text-foreground">{flipped ? back : front}</p>
    </button>
  );
}

function QuizQuestion({
  question,
  options,
  correctIndex,
  explanation,
}: Quiz["questions"][number]) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;
          const showState = selected !== null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              disabled={showState}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                !showState && "border-border hover:bg-surface-hover",
                showState && isCorrect && "border-success bg-success-bg text-success",
                showState && isSelected && !isCorrect && "border-danger bg-danger-bg text-danger",
                showState && !isSelected && !isCorrect && "border-border opacity-50"
              )}
            >
              {opt}
              {showState && isCorrect && <Check size={14} />}
              {showState && isSelected && !isCorrect && <X size={14} />}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className="mt-3 text-xs text-muted">{explanation}</p>
      )}
    </div>
  );
}

function renderLessonBody(format: string, content: unknown) {
  switch (format) {
    case "flashcards": {
      const data = content as Flashcards;
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.cards.map((c, i) => (
            <Flashcard key={i} front={c.front} back={c.back} />
          ))}
        </div>
      );
    }
    case "before-after": {
      const data = content as BeforeAfter;
      return (
        <div className="flex flex-col gap-4">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-danger line-through decoration-danger/50">
                {item.before}
              </p>
              <p className="mt-2 text-sm font-medium text-success">{item.after}</p>
              <p className="mt-2 text-xs text-muted">{item.why}</p>
            </div>
          ))}
        </div>
      );
    }
    case "quiz": {
      const data = content as Quiz;
      return (
        <div className="flex flex-col gap-3">
          {data.questions.map((q, i) => (
            <QuizQuestion key={i} {...q} />
          ))}
        </div>
      );
    }
    case "star-method": {
      const data = content as StarMethod;
      const rows: [string, string][] = [
        ["Situation", data.situation],
        ["Task", data.task],
        ["Action", data.action],
        ["Result", data.result],
      ];
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">{data.explanation}</p>
          <div className="flex flex-col gap-2">
            {rows.map(([label, text]) => (
              <div key={label} className="rounded-xl border border-border bg-background p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {label}
                </span>
                <p className="mt-1 text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "vocabulary": {
      const data = content as Vocabulary;
      return (
        <div className="flex flex-col gap-3">
          {data.terms.map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">{t.term}</p>
              <p className="mt-1 text-sm text-muted">{t.meaning}</p>
              <p className="mt-1 text-xs italic text-muted">&ldquo;{t.example}&rdquo;</p>
            </div>
          ))}
        </div>
      );
    }
    case "mistake-patterns": {
      const data = content as MistakePatterns;
      return (
        <div className="flex flex-col gap-3">
          {data.patterns.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">{p.pattern}</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {p.examples.map((ex, j) => (
                  <li key={j}>{ex}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-success">Fix: {p.fix}</p>
            </div>
          ))}
        </div>
      );
    }
    case "checklist": {
      const data = content as Checklist;
      return <ChecklistBody items={data.items} />;
    }
    case "mini-article": {
      const data = content as MiniArticle;
      return (
        <div className="flex flex-col gap-4">
          {data.sections.map((s, i) => (
            <div key={i}>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{s.heading}</h3>
              <p className="text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      );
    }
    case "roleplay-redo": {
      const data = content as RoleplayRedo;
      return (
        <div className="flex flex-col gap-4">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">{item.question}</p>
              <p className="mt-2 text-sm text-muted">
                <span className="text-[11px] font-medium uppercase text-muted">You said: </span>
                {item.yourAnswer}
              </p>
              <p className="mt-2 text-sm text-success">
                <span className="text-[11px] font-medium uppercase text-success">
                  Stronger:{" "}
                </span>
                {item.strongerAnswer}
              </p>
            </div>
          ))}
        </div>
      );
    }
    case "spaced-drill": {
      const data = content as SpacedDrill;
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.prompts.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">{p.prompt}</p>
              <p className="mt-2 text-xs text-muted">{p.outline}</p>
            </div>
          ))}
        </div>
      );
    }
    default:
      return <p className="text-sm text-muted">{JSON.stringify(content)}</p>;
  }
}

function ChecklistBody({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <label
          key={i}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <input
            type="checkbox"
            checked={Boolean(checked[i])}
            onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          <span
            className={cn(
              "text-sm text-foreground",
              checked[i] && "text-muted line-through"
            )}
          >
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}

export function LessonPanel({
  format,
  title,
  content,
}: {
  format: string;
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(true);
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = null;
  }

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <GraduationCap size={14} />
        Lesson: {title}
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
                {parsed ? (
                  renderLessonBody(format, parsed)
                ) : (
                  <p className="text-sm text-muted">Couldn&apos;t load this lesson.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
