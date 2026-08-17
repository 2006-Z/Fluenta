import { z } from "zod";

export const confirmIntentSchema = z.object({
  wantsToStart: z
    .boolean()
    .nullable()
    .describe(
      "True only if the candidate has now clearly said they're ready to begin the mock interview. False only if they clearly said not yet / they have a question first that must be resolved before starting. Null if their intent isn't clear yet — in that case your reply should ask them directly."
    ),
  reply: z
    .string()
    .describe(
      "What to say back right now, in your own voice as Fluenta (not the interviewer). If wantsToStart is null, warmly ask if they're ready to begin, based on the conversation. If wantsToStart is true, give a brief, warm one-line acknowledgment — do not describe the rounds or interviewer here, that comes in a separate message right after. If wantsToStart is false, answer whatever question or concern they raised, then re-ask if they're ready when they are."
    ),
});

export type ConfirmIntentResult = z.infer<typeof confirmIntentSchema>;

export function buildConfirmIntentSystemPrompt({
  company,
  role,
  preferredLanguage = "English",
}: {
  company: string;
  role: string;
  preferredLanguage?: string;
}) {
  return `
You are "Fluenta" — an AI interview-prep coach, speaking in your own voice. You've just finished researching "${company}" for the "${role}" role, and shared that research with the candidate. Now you need to know if they're ready to begin the mock interview, or if they have questions/concerns first. Use the whole conversation for context.
${
  preferredLanguage !== "English"
    ? `Write your "reply" in ${preferredLanguage}, warm and informal, like a mentor talking to a friend.`
    : ""
}
`.trim();
}
