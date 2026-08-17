import { z } from "zod";

export const interviewReplySchema = z.object({
  reaction: z
    .string()
    .describe(
      "A short 1-2 sentence in-character reaction to the CONTENT of the candidate's last answer (acknowledge, gently probe, or react to what they said) — the way a real interviewer would respond. Must NOT mention grammar/wording/corrections at all (those go only in the separate corrections field), and must NOT contain or preview any question (the question goes only in nextQuestion). This field is reaction only — nothing else."
    ),
  answerFeedback: z
    .string()
    .describe(
      "Honest, substantive feedback on whether the candidate's answer actually addressed what was asked — was it relevant, complete, specific enough (real examples/details vs vague generalities)? If they missed part of the question or gave a shallow answer, say so plainly and briefly note what a stronger answer would include. 1-2 sentences. This is about the CONTENT/quality of their answer, not grammar — that goes only in corrections."
    ),
  corrections: z
    .array(
      z.object({
        wrong: z.string().describe("The exact incorrect phrase from the candidate's message."),
        fix: z.string().describe("The corrected phrase."),
        why: z.string().describe("One short reason, under 12 words."),
      })
    )
    .describe(
      "Every English mistake (grammar, word choice, phrasing, sentence structure, and punctuation/pause boundaries — missing commas, run-on sentences, wrong sentence breaks) in the candidate's last message. Do NOT flag capitalization-only differences (e.g. 'hello' vs 'Hello', a name in lowercase) — this is a spoken-interview practice tool, letter casing doesn't matter when speaking. Empty array if there were no real mistakes."
    ),
  nextQuestion: z
    .string()
    .describe(
      "The next interview question to ask, following naturally from the conversation so far. State it exactly once — do not repeat or paraphrase it in the reaction field."
    ),
  newTargetMentioned: z
    .string()
    .nullable()
    .describe(
      "Set this ONLY if the candidate's latest message expresses interest in practicing for a DIFFERENT company and/or role than the one this conversation is locked to — name it briefly, e.g. 'Data Analyst at Swiggy'. Null in the normal case where they're still talking about the current company/role."
    ),
  languageChangeRequested: z
    .enum(["English", "Hindi", "Hinglish"])
    .nullable()
    .describe(
      "Set this ONLY if the candidate explicitly asks to change the language their answer-feedback is given in (e.g. 'give feedback in Hindi', 'switch to Hinglish', 'English please'). Null in the normal case."
    ),
  interviewComplete: z
    .boolean()
    .describe(
      "True if this interview has now reached a natural close — either you (as interviewer) are wrapping up after covering a reasonably full arc (rapport, behavioral, role-specific/technical, and a closing question), or the candidate explicitly asked to end/stop the interview. When true, 'nextQuestion' should instead be a warm closing line (e.g. thanking them, saying you'll be in touch) rather than another question. False in the normal case, while the interview is still ongoing."
    ),
  planStepsDone: z
    .number()
    .int()
    .min(0)
    .describe(
      "How many stages of the interview plan checklist (shown in the system prompt, if any) are now fully finished, counting from the first. 0 if none yet. Never decreases turn to turn."
    ),
});

export type InterviewReply = z.infer<typeof interviewReplySchema>;

export function formatInterviewReply(
  reply: InterviewReply,
  context: { company: string; role: string }
): string {
  const parts: string[] = [];

  if (reply.languageChangeRequested) {
    parts.push(
      `{{system-note}}Sure — I'll give your answer feedback in ${reply.languageChangeRequested} from my next reply onward.{{/system-note}}`
    );
  }

  if (reply.newTargetMentioned) {
    parts.push(
      `{{system-note}}It sounds like you're also interested in practicing for ${reply.newTargetMentioned}. Let's keep this conversation focused on your ${context.role} interview at ${context.company} — feel free to start a new conversation for that one!{{/system-note}}`
    );
  }

  parts.push(reply.reaction.trim());

  const correctionMarkers = reply.corrections
    .map((c) => `[[wrong: ${c.wrong}||fix: ${c.fix}||why: ${c.why}]]`)
    .join(" ");
  const feedbackBlockInner = correctionMarkers
    ? `${reply.answerFeedback.trim()}\n${correctionMarkers}`
    : reply.answerFeedback.trim();
  parts.push(`{{feedback-block}}${feedbackBlockInner}{{/feedback-block}}`);

  parts.push(
    reply.interviewComplete
      ? reply.nextQuestion.trim()
      : `**${reply.nextQuestion.trim()}**`
  );

  return parts.join("\n\n");
}
