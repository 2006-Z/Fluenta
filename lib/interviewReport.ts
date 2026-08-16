import { z } from "zod";
import { generateObject, type ModelMessage } from "ai";
import { chatModel } from "@/lib/ai";

export const reportSchema = z.object({
  overallVerdict: z
    .enum(["strong", "needs-improvement"])
    .describe(
      "Honest overall verdict on this interview performance. Use 'needs-improvement' whenever there are real, addressable gaps — don't default to 'strong' just to be nice."
    ),
  summary: z
    .string()
    .describe("2-3 sentence honest overall summary of how the interview went."),
  strengths: z
    .array(z.string())
    .describe("2-5 specific, genuine strengths shown in this interview. Empty array if truly none."),
  weaknesses: z
    .array(z.string())
    .describe(
      "2-5 specific, honest weaknesses or gaps shown in this interview — content/substance gaps AND recurring English issues, whichever applied. Empty array only if performance was genuinely excellent throughout."
    ),
  languageNotes: z
    .string()
    .describe(
      "1-3 sentences on the candidate's English fluency/grammar across the interview specifically (separate from interview-content feedback)."
    ),
});

export type InterviewReport = z.infer<typeof reportSchema>;

export async function generateInterviewReport({
  company,
  role,
  messages,
}: {
  company: string;
  role: string;
  messages: ModelMessage[];
}): Promise<InterviewReport> {
  const systemPrompt = `
You are an experienced hiring manager writing an honest, constructive post-interview performance report for a candidate who just finished a mock interview for the "${role}" role at "${company}". Base your assessment ONLY on what's in the conversation transcript below. Be honest and specific, not falsely encouraging — a report that calls everything "strong" when it wasn't helps no one.
`.trim();

  const { object } = await generateObject({
    model: chatModel,
    system: systemPrompt,
    messages,
    schema: reportSchema,
  });

  return object;
}

export function formatReportMarkdown(report: InterviewReport, company: string, role: string) {
  const parts: string[] = [];
  parts.push(`## Interview report — ${role} at ${company}`);
  parts.push(report.summary);
  if (report.strengths.length > 0) {
    parts.push(`**Strengths**\n${report.strengths.map((s) => `- ${s}`).join("\n")}`);
  }
  if (report.weaknesses.length > 0) {
    parts.push(`**Areas to improve**\n${report.weaknesses.map((s) => `- ${s}`).join("\n")}`);
  }
  parts.push(`**English & fluency**\n${report.languageNotes}`);
  return parts.join("\n\n");
}
