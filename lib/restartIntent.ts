import { z } from "zod";

export const restartIntentSchema = z.object({
  wantsToRestart: z
    .boolean()
    .nullable()
    .describe(
      "True only if the candidate has now clearly said they want to practice this same interview again. False only if they've clearly said they do NOT want to restart, or are asking about something unrelated to restarting. Null if their intent isn't clear yet from what they've said — in that case your reply should ask them directly."
    ),
  reply: z
    .string()
    .describe(
      "What to say back to the candidate right now, using the full conversation for context. If wantsToRestart is null, warmly remind them in one line that this mock interview is already complete, and ask whether they'd like to run through it again from the start, or if there's something else on their mind. If wantsToRestart is true, warmly confirm you'll set up a fresh practice round right now — do not ask another question or greet them yet, the very next message in this conversation will already be the new interview's opening. If wantsToRestart is false, just respond naturally and helpfully to whatever they actually said or asked instead."
    ),
});

export type RestartIntentResult = z.infer<typeof restartIntentSchema>;

export function buildRestartIntentSystemPrompt({
  company,
  role,
  verdict,
}: {
  company: string;
  role: string;
  verdict: string | null;
}) {
  return `
You are a warm, fluent AI interview-prep coach. The candidate already completed a mock interview for the "${role}" role at "${company}" earlier in this same conversation${
    verdict
      ? ` (their result: ${verdict === "strong" ? "a strong performance" : "needs improvement"})`
      : ""
  }. They've now sent a new message here, after that interview had already ended. Using the conversation for context, figure out whether they want to practice this same interview again from scratch, or whether they're asking about something else entirely — don't assume either way without a clear signal from what they've actually said.
`.trim();
}
