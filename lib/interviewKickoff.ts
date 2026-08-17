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
    .array(z.string())
    .min(3)
    .max(6)
    .describe(
      "3-6 short stage labels (under 8 words each, no numbering, plain text — e.g. 'Rapport-building intro', 'Behavioral questions', 'Role-specific technical questions', 'Closing') naming the stages this interview will move through, in order, tailored to this specific company/role using the research above. The candidate will see these as a progress checklist that fills in as the interview moves through each stage."
    ),
});

export type KickoffResult = z.infer<typeof kickoffSchema>;
