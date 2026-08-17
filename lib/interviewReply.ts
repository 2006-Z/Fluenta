import { z } from "zod";

export const interviewReplySchema = z.object({
  messageType: z
    .enum(["informal", "formal", "mixed"])
    .describe(
      "Classify the candidate's last message. 'informal' = casual chat, small talk, or a logistics remark with no actual interview-answer content (e.g. 'give me a sec', 'haha ok', 'can you repeat that'). 'formal' = a real interview answer with no unrelated chit-chat mixed in. 'mixed' = it contains both a real interview answer AND some casual/unrelated remark in the same message."
    ),
  fluentaReply: z
    .string()
    .nullable()
    .describe(
      "Your own casual, friendly voice as Fluenta (the coach) — NOT the interviewer persona. Required (non-null) when messageType is 'informal' or 'mixed', responding briefly and warmly to the casual part. Null when messageType is 'formal'."
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
      "Real grammar mistakes only — wrong verb tense, subject-verb disagreement, wrong word choice/preposition, or phrasing so unclear a listener would be confused. This is a SPOKEN-interview practice tool: NEVER flag spelling, typos, punctuation, or capitalization (e.g. lowercase 'i', missing commas/periods) — none of that matters when speaking aloud. Empty array if there were no real grammar issues, or if messageType is 'informal'."
    ),
  interviewerReaction: z
    .string()
    .nullable()
    .describe(
      "The interviewer's short 1-2 sentence in-character reaction to the CONTENT of the candidate's answer. Required (non-null) when messageType is 'formal' or 'mixed'. Null when messageType is 'informal' — the interviewer stays silent for purely casual messages, only Fluenta responds."
    ),
  answerFeedback: z
    .string()
    .nullable()
    .describe(
      "Honest, substantive feedback on whether the answer actually addressed what was asked. Required (non-null) when messageType is 'formal' or 'mixed'. Null when messageType is 'informal'."
    ),
  nextQuestion: z
    .string()
    .nullable()
    .describe(
      "The next interview question. Required (non-null) when messageType is 'formal' or 'mixed' — the interview always keeps moving forward on any real answer. Null ONLY when messageType is 'informal' (no real answer was given yet, so don't advance)."
    ),
  newTargetMentioned: z
    .string()
    .nullable()
    .describe(
      "Set this ONLY if the candidate's latest message expresses interest in practicing for a DIFFERENT company and/or role than the one this conversation is locked to. Null in the normal case."
    ),
  languageChangeRequested: z
    .enum(["English", "Hindi", "Hinglish"])
    .nullable()
    .describe(
      "Set this ONLY if the candidate explicitly asks to change the language their answer-feedback is given in. Null in the normal case."
    ),
  roundComplete: z
    .boolean()
    .describe(
      "True if the CURRENT round (see the rounds list in the system prompt) has now been fully and naturally covered by this exchange, so it's time to wrap up this round and move to the next one (or finish the interview if this was the last round). Only ever true on a 'formal' or 'mixed' message, never on 'informal'. False in the normal case."
    ),
  interviewComplete: z
    .boolean()
    .describe(
      "True if this was the LAST round and it has now reached a natural close, or the candidate explicitly asked to end/stop the interview. When true, 'nextQuestion' should instead be a SHORT interviewer sign-off (1 sentence, e.g. thank them and say they're free to go) — do NOT give feedback, a verdict, or any assessment here, since the coach will follow up separately with all of that right after."
    ),
  companyKnowledgeGapShown: z
    .boolean()
    .describe(
      "True if the candidate's answer in THIS turn reveals they don't actually know basic facts about the company or role (e.g. confused about what the company does, contradicts the research, or admits they haven't looked into it). False in the normal case, and always false for 'informal' messages."
    ),
});

export type InterviewReply = z.infer<typeof interviewReplySchema>;

export function formatInterviewReply(
  reply: InterviewReply,
  context: { company: string; role: string }
): { text: string; isFluentaVoice: boolean } {
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

  if (reply.messageType === "informal") {
    parts.push((reply.fluentaReply ?? "").trim());
    return { text: parts.join("\n\n"), isFluentaVoice: true };
  }

  if (reply.messageType === "mixed" && reply.fluentaReply) {
    parts.push(`{{system-note}}${reply.fluentaReply.trim()}{{/system-note}}`);
  }

  parts.push((reply.interviewerReaction ?? "").trim());

  const correctionMarkers = reply.corrections
    .map((c) => `[[wrong: ${c.wrong}||fix: ${c.fix}||why: ${c.why}]]`)
    .join(" ");
  const feedbackBlockInner = correctionMarkers
    ? `${(reply.answerFeedback ?? "").trim()}\n${correctionMarkers}`
    : (reply.answerFeedback ?? "").trim();
  if (feedbackBlockInner) {
    parts.push(`{{feedback-block}}${feedbackBlockInner}{{/feedback-block}}`);
  }

  const question = (reply.nextQuestion ?? "").trim();
  parts.push(reply.interviewComplete ? question : `**${question}**`);

  return { text: parts.join("\n\n"), isFluentaVoice: false };
}
