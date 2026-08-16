import { z } from "zod";
import { generateText } from "ai";
import { chatModel } from "@/lib/ai";

export const planSchema = z.object({
  plan: z
    .string()
    .describe(
      "A short interview plan for the candidate, written directly to them, in plain markdown with a few short bullet points — the rounds/topics this mock interview will cover, in order (e.g. rapport-building intro, behavioral questions, role-specific/technical questions, closing). 3-5 bullets max, one line each."
    ),
});

export async function buildInterviewPlan(
  company: string,
  role: string,
  research: string | null
): Promise<string> {
  const prompt = `
Based on this research about "${company}" and the "${role}" role, write a short interview PLAN for the candidate — the structure of the mock interview they're about to do, not the research itself.

Research:
${research ?? "No detailed research available."}

Write 3-5 short bullet points (plain markdown, "- " bullets) naming the stages this interview will move through, in order, tailored to this specific company/role (e.g. mention a realistic technical/situational topic area from the research, not just generic labels). Keep each bullet under 15 words. Write directly to the candidate ("We'll start with...", "Then I'll ask about...").
`.trim();

  const result = await generateText({ model: chatModel, prompt });
  return result.text.trim();
}
