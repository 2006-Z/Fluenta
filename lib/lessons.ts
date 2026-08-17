import { generateObject, type ModelMessage } from "ai";
import { chatModel } from "@/lib/ai";
import type { InterviewReport } from "@/lib/interviewReport";
import {
  LESSON_SCHEMAS,
  getLessonFormat,
  type LessonFormatId,
} from "@/lib/lessonFormats";

export async function generateLesson({
  formatId,
  company,
  role,
  report,
  messages,
}: {
  formatId: LessonFormatId;
  company: string;
  role: string;
  report: InterviewReport;
  messages: ModelMessage[];
}): Promise<{ title: string; content: unknown }> {
  const format = getLessonFormat(formatId);
  const schema = LESSON_SCHEMAS[formatId];

  const systemPrompt = `
You are a supportive but honest English-fluency and interview coach creating a follow-up lesson for a candidate after a mock interview for the "${role}" role at "${company}" that needs improvement.

Their weaknesses from the interview report:
${report.weaknesses.map((w) => `- ${w}`).join("\n") || "- General interview readiness"}

Their English/language notes:
${report.languageNotes}

Lesson format: "${format.label}". ${format.instructions}

Ground everything in the actual interview transcript below where relevant (use their real answers/mistakes, don't invent generic content when specific examples are available).

Keep every text field concise and scannable — a few short sentences at most, not a long article. This renders as markdown (so **bold**, "- " bullets, and short "## " headings inside a single field are fine when genuinely useful), but favor brevity over completeness; the candidate should be able to read the whole lesson in under a minute.
`.trim();

  const { object } = await generateObject({
    model: chatModel,
    system: systemPrompt,
    messages,
    schema,
  });

  return { title: format.label, content: object };
}
