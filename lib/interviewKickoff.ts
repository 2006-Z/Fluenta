import { z } from "zod";

export const kickoffSchema = z.object({
  interviewerName: z
    .string()
    .describe(
      "A plausible first name you're picking for yourself as the interviewer (e.g. 'Amit', 'Priya'). Never a placeholder like '[Your Name]'."
    ),
  greeting: z
    .string()
    .describe(
      "Your opening message to the candidate: warmly greet them, briefly introduce yourself (using the interviewerName above) and your team's context, confirm you'll be interviewing them for this role today, then ease in with a simple rapport-building opener (e.g. asking them to introduce themselves and what drew them to this role) rather than a hard question first."
    ),
  plan: z
    .string()
    .describe(
      "A short interview plan for the candidate, written directly to them, in plain markdown with 3-5 short bullet points ('- ' bullets, under 15 words each) naming the stages this interview will move through in order (e.g. rapport-building intro, behavioral questions, role-specific/technical questions, closing), tailored to this specific company/role using the research above."
    ),
});

export type KickoffResult = z.infer<typeof kickoffSchema>;
