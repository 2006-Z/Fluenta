import { z } from "zod";

/**
 * Ten distinct pedagogical "shapes" a lesson can take. Picking a different
 * one each time (see pickLessonFormat) keeps repeat visits from feeling like
 * the same worksheet reskinned. More formats can be appended here later —
 * nothing else needs to change to support that.
 */
export const LESSON_FORMATS = [
  {
    id: "flashcards",
    label: "Flashcards",
    instructions:
      "Create 6-10 flashcards drilling the specific weak areas from this interview. Each card has a short prompt on the front and the answer/explanation on the back.",
  },
  {
    id: "before-after",
    label: "Before & After",
    instructions:
      "Take 4-6 of the candidate's actual weak answers from this interview and rewrite each as a strong version, explaining briefly why the rewrite is better.",
  },
  {
    id: "quiz",
    label: "Quick Quiz",
    instructions:
      "Write 5-8 multiple-choice questions (4 options each) testing the concepts the candidate struggled with. Include the correct option index and a one-line explanation per question.",
  },
  {
    id: "star-method",
    label: "STAR Method Builder",
    instructions:
      "Explain the STAR method (Situation, Task, Action, Result) for behavioral answers, tailored to this candidate's weak spots, then provide one fully worked example STAR answer relevant to their target role.",
  },
  {
    id: "vocabulary",
    label: "Vocabulary Builder",
    instructions:
      "List 6-10 professional/industry terms or phrases the candidate should know or use better for this role, each with a plain-English meaning and an example sentence.",
  },
  {
    id: "mistake-patterns",
    label: "Mistake Patterns",
    instructions:
      "Identify 3-5 recurring patterns in the candidate's English mistakes from this interview (not one-off typos — real patterns), each with 2-3 real examples from their answers and a clear fix.",
  },
  {
    id: "checklist",
    label: "Prep Checklist",
    instructions:
      "Write a 6-10 item actionable checklist the candidate should work through before their next attempt, directly addressing the weaknesses shown in this interview.",
  },
  {
    id: "mini-article",
    label: "Mini Article",
    instructions:
      "Write a short, warm, mentor-style article (3-5 short sections with headings) explaining the core skill gap from this interview and how to close it, like a coach writing a personal note.",
  },
  {
    id: "roleplay-redo",
    label: "Roleplay Redo",
    instructions:
      "Pick 3-5 of the toughest questions from this interview and, for each, show the candidate's actual answer next to a model stronger answer they can study and practice saying out loud.",
  },
  {
    id: "spaced-drill",
    label: "Quick-Fire Drill",
    instructions:
      "Write 6-10 rapid-fire practice prompts (short questions or sentence starters) targeting the weak areas, each with a one-line outline of what a strong response should cover.",
  },
] as const;

export type LessonFormatId = (typeof LESSON_FORMATS)[number]["id"];

/** Deterministic-ish rotation: pick a format not yet used for this
 * conversation's user, cycling through all 10 before repeating. */
export function pickLessonFormat(usedFormats: string[]): LessonFormatId {
  const unused = LESSON_FORMATS.filter((f) => !usedFormats.includes(f.id));
  const pool = unused.length > 0 ? unused : LESSON_FORMATS;
  const choice = pool[Math.floor(Math.random() * pool.length)];
  return choice.id;
}

export function getLessonFormat(id: string) {
  return LESSON_FORMATS.find((f) => f.id === id) ?? LESSON_FORMATS[0];
}

const flashcardsSchema = z.object({
  cards: z.array(z.object({ front: z.string(), back: z.string() })).min(4),
});

const beforeAfterSchema = z.object({
  items: z
    .array(
      z.object({ before: z.string(), after: z.string(), why: z.string() })
    )
    .min(3),
});

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string(),
      })
    )
    .min(4),
});

const starMethodSchema = z.object({
  explanation: z.string(),
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
});

const vocabularySchema = z.object({
  terms: z
    .array(
      z.object({
        term: z.string(),
        meaning: z.string(),
        example: z.string(),
      })
    )
    .min(4),
});

const mistakePatternsSchema = z.object({
  patterns: z
    .array(
      z.object({
        pattern: z.string(),
        examples: z.array(z.string()).min(1),
        fix: z.string(),
      })
    )
    .min(2),
});

const checklistSchema = z.object({
  items: z.array(z.string()).min(4),
});

const miniArticleSchema = z.object({
  title: z.string(),
  sections: z
    .array(z.object({ heading: z.string(), body: z.string() }))
    .min(2),
});

const roleplayRedoSchema = z.object({
  items: z
    .array(
      z.object({
        question: z.string(),
        yourAnswer: z.string(),
        strongerAnswer: z.string(),
      })
    )
    .min(2),
});

const spacedDrillSchema = z.object({
  prompts: z
    .array(z.object({ prompt: z.string(), outline: z.string() }))
    .min(4),
});

export const LESSON_SCHEMAS: Record<LessonFormatId, z.ZodTypeAny> = {
  flashcards: flashcardsSchema,
  "before-after": beforeAfterSchema,
  quiz: quizSchema,
  "star-method": starMethodSchema,
  vocabulary: vocabularySchema,
  "mistake-patterns": mistakePatternsSchema,
  checklist: checklistSchema,
  "mini-article": miniArticleSchema,
  "roleplay-redo": roleplayRedoSchema,
  "spaced-drill": spacedDrillSchema,
};
