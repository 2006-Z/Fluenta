import { generateText } from "ai";
import { chatModel } from "@/lib/ai";
import type { InterviewReport } from "@/lib/interviewReport";

export async function generateWrapupMessage({
  company,
  role,
  report,
  includeResearchWalkthrough,
  research,
  preferredLanguage = "English",
}: {
  company: string;
  role: string;
  report: InterviewReport;
  includeResearchWalkthrough: boolean;
  research?: string | null;
  preferredLanguage?: string;
}) {
  const prompt = `
You are "Fluenta" — an AI interview-prep coach, speaking in your own warm, honest voice (the roleplay interviewer has just stepped out). The candidate finished a mock interview for the "${role}" role at "${company}". Write ONE message to them now that:

1. Never says whether they "got the job" or "will pass" as a fact — only speaks in terms of the estimated likelihood below, phrased naturally (e.g. "based on this practice run, I'd put your chances at roughly X%") — never a hard yes/no verdict.
2. Walks them through the report below in plain, conversational language — don't just repeat it verbatim, actually explain what it means for them and what to focus on next. Mention the estimated hire probability naturally within this.
3. ${
    report.lessonRecommended
      ? "Mention that you've put together a short follow-up lesson for them targeting their biggest gap, and briefly say what it covers."
      : "Do NOT mention or offer a follow-up lesson — none is needed this time, their performance didn't need one."
  }
${
  includeResearchWalkthrough
    ? `4. The candidate skipped the company/role walkthrough before this interview, and it became clear during the interview that they don't actually know much about ${company} or the ${role} role. So also include, in this same message, a genuinely useful plain-language explanation of the company and role, using the research below — the kind of thing that will actually help them for their real interview.`
    : ""
}

Report:
- Estimated hire probability: ${report.hireProbability}%
- Summary: ${report.summary}
- Strengths: ${report.strengths.join("; ") || "none noted"}
- Areas to improve: ${report.weaknesses.join("; ") || "none noted"}
- English/fluency notes: ${report.languageNotes}

${includeResearchWalkthrough && research ? `Company/role research:\n${research}` : ""}

Keep it warm and encouraging even when the news isn't great — like a professional mentor who wants them to actually improve, not a scorecard. Never use slang or casual address like "bro"/"bhai"/"yaar". Use light markdown (short paragraphs, occasional **bold**, bullet points if listing multiple things) so it's easy to read, not a wall of text.
${
  preferredLanguage !== "English"
    ? `Write this whole message in ${preferredLanguage}, warm but professional, like a knowledgeable career mentor, not a casual friend.`
    : ""
}
`.trim();

  const result = await generateText({ model: chatModel, prompt });
  return result.text.trim();
}
