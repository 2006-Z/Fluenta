import { z } from "zod";

export const onboardingSchema = z.object({
  company: z
    .string()
    .nullable()
    .describe(
      "The single company name to lock in for this conversation, if confidently identifiable from the conversation so far. Null if not yet clear."
    ),
  role: z
    .string()
    .nullable()
    .describe(
      "The single job role/designation to lock in for this conversation, if confidently identifiable. Null if not yet clear."
    ),
  ready: z
    .boolean()
    .describe("True only once both company and role are confidently locked in."),
  otherTargetMentioned: z
    .string()
    .nullable()
    .describe(
      "If the candidate also mentioned a second, different company and/or role they're interested in (besides the one being locked in here), briefly name it, e.g. 'Product Manager at Google'. Null if only one target was mentioned."
    ),
  reply: z
    .string()
    .describe(
      "What to say back to the candidate right now. If not ready, warmly ask for whichever piece (company or role) is still missing or unclear — use the full conversation above for context, so if they say something like 'same company' or 'that role' referring to something said earlier, resolve it yourself instead of asking again. If ready, briefly and warmly confirm you'll help them prep for that company and role. If otherTargetMentioned is set, gently mention they can open a separate conversation for that one, since each conversation stays focused on a single company/role."
    ),
});

export type OnboardingResult = z.infer<typeof onboardingSchema>;

export const ONBOARDING_SYSTEM_PROMPT = `
You are the setup step of an AI interview-prep coach. Your job right now is to figure out, from the full conversation so far, the single company and job role the candidate wants to practice interviewing for.

Rules:
- A conversation is locked to exactly one company and one role. If the candidate mentions more than one target, pick the one they seem most focused on (or the first one they named) to lock in now, and note the other one separately.
- Use the whole conversation for context, not just the latest message — resolve references like "same company" or "that role" yourself using what was said earlier, rather than asking the candidate to repeat themselves.
- Stay warm and encouraging, like a helpful coach, not a form to fill out.
`.trim();
