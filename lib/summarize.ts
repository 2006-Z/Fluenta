import { generateText } from "ai";
import { chatModel } from "@/lib/ai";

const SUMMARY_PROMPT = `
You are compressing part of an ongoing mock-interview conversation into a concise but complete running summary, so a future AI turn can continue naturally without needing the full raw transcript.

Preserve, in flowing prose (not a question-by-question transcript):
- Everything the candidate has revealed about themselves (background, experience, specific projects/examples, resume details they've mentioned)
- Which interview topics/questions have already been covered, so they are not repeated
- The overall tone and rapport established so far
- Any recurring English mistakes the candidate tends to make, so correction patterns aren't lost
- Anything unresolved or worth following up on

Keep the result under 300 words even as the conversation grows — prioritize what most affects how the interview should continue. Do not include meta-commentary about the summarization process itself.
`.trim();

export async function summarizeConversation({
  existingSummary,
  newMessages,
}: {
  existingSummary?: string | null;
  newMessages: { role: string; content: string }[];
}): Promise<string> {
  const transcript = newMessages
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n\n");

  const prompt = existingSummary
    ? `Here is the summary of the conversation so far:\n${existingSummary}\n\nHere are the newer messages since that summary — fold them in and produce one updated summary:\n${transcript}`
    : `Here are the messages to summarize:\n${transcript}`;

  const result = await generateText({
    model: chatModel,
    system: SUMMARY_PROMPT,
    prompt,
  });

  return result.text.trim();
}
