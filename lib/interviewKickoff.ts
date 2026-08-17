import { z } from "zod";

export const roundSchema = z.object({
  name: z.string().describe("Short round label, e.g. 'Round 1', 'Technical Round'."),
  type: z
    .string()
    .describe(
      "The kind of round, e.g. 'HR', 'Technical', 'Behavioral', 'Managerial', 'Coding'. Use 'Coding' only if this specific role genuinely involves writing code as part of a real interview for it — most roles should not have a coding round."
    ),
});

export const kickoffSchema = z.object({
  interviewerName: z
    .string()
    .describe(
      "A plausible first name you're picking for yourself as the interviewer (e.g. 'Amit', 'Priya'). Never a placeholder like '[Your Name]'."
    ),
  rounds: z
    .array(roundSchema)
    .min(1)
    .max(4)
    .describe(
      "1-4 realistic rounds this specific company/role's interview would have, in order, based on the research above (e.g. a small company might do just one combined round; a technical role might have HR + Technical; only include a Coding round if the research genuinely supports it for this role)."
    ),
  estimatedTurns: z
    .number()
    .int()
    .min(4)
    .max(30)
    .describe(
      "Your honest estimate of how many total candidate replies (across all rounds combined) this whole mock interview will realistically take before it naturally wraps up. Used only to drive a progress indicator — estimate generously but realistically (roughly 3-6 candidate replies per round is typical)."
    ),
  introMessage: z
    .string()
    .describe(
      "A message in YOUR OWN VOICE as Fluenta (the coach), NOT as the interviewer — spoken directly to the candidate, warmly explaining: who will interview them (the interviewerName above), how many rounds there will be, and briefly what kind of round each one will be (e.g. 'ek HR round hoga, phir ek Technical round'). Do NOT reveal exact question topics or a step-by-step agenda — just the round count and round types, the way a real candidate would only know 'there will be 2 rounds: HR and Technical' beforehand, nothing more specific."
    ),
  interviewerGreeting: z
    .string()
    .describe(
      "The interviewer's own first message, in character, using the interviewerName above: warmly greet the candidate, briefly introduce yourself and your team's context, confirm you'll be interviewing them for this role today, then ease in with a simple rapport-building opener (e.g. asking them to introduce themselves) rather than a hard question first. This is a separate message from introMessage — the coach has already explained the structure, so jump straight into being the interviewer here."
    ),
});

export type KickoffResult = z.infer<typeof kickoffSchema>;
