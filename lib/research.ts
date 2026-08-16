import { generateText } from "ai";
import { researchModel } from "@/lib/ai";

export async function researchCompanyRole(
  company: string,
  role: string,
  jobDescription?: string
): Promise<string> {
  const prompt = `
You are writing a briefing for a first-time job candidate who has never worked in a professional environment before and knows nothing about "${company}" or the "${role}" role. Research them thoroughly and write a briefing that makes this stranger feel genuinely prepared and confident, not just informed.

${jobDescription ? `The candidate has also provided this job description for context:\n${jobDescription}\n` : ""}

Write in plain, warm, encouraging English — like a mentor explaining things to a friend, not a corporate report. Every piece of jargon must be explained in plain words the first time it appears. Use concrete, relatable examples rather than abstract descriptions. Structure it with these "## " headers, in this order:

## Company overview
What does this company actually do, in one or two sentences a complete outsider would understand? Give a concrete example of their business in action (e.g. "if Company X needs Y, they call this company, who does Z"). Mention size, founding info, and any leadership credentials that signal credibility — and briefly explain WHY that credential matters if it's not obvious (e.g. what makes a certain past employer or qualification notable). Be honest about scale — if it's a small or mid-size company rather than a big brand, say so plainly and note what that means for the candidate (still a legitimate opportunity, just set expectations correctly) rather than overselling it.

## What this company actually sells (if relevant)
If the company has multiple products, services, or sub-brands, list them in a short table (name + who it's for). Skip this section if the company has one simple offering.

## A day in this role
Walk through what a typical workday actually looks like for someone in this exact role, as a short narrative (not a bullet list of generic responsibilities). Be specific and concrete — what do they open on their computer, who do they talk to, what decisions do they make. If it's honestly repetitive or unglamorous work, say so plainly, but also say what the candidate gets out of it (real experience, a resume line, income) rather than pretending it's more exciting than it is.

## Words you'll hear on the job
Pick the 2-3 most important pieces of jargon specific to this role/industry and explain each in one clear contrasting sentence (e.g. "X means the info didn't match; Y means nobody could confirm it at all"). Then list any other common acronyms or short-forms for this role as a compact glossary (term = meaning), only if genuinely relevant.

## Why this field is growing (if you can find a real stat)
If you can find one real, citable industry statistic relevant to this role or company's industry, state it in one sentence with its source. If nothing credible is available, skip this section entirely rather than inventing a number.

## What the interview will be like
Based on what's discoverable (candidate review sites, job boards, public interview reports), describe the realistic interview process and format for this role at this company — number of rounds, what each round tests, difficulty level. If nothing company-specific is available, give a realistic general expectation for this type of role and say so.

## What they're looking for
What skills, qualities, or signals is this company/role likely screening for? Then give 3-5 realistic example interview questions.

## About the pay (only if a number is known or typical for this role/level)
If a salary figure is known or typical for this role, briefly explain what "in-hand" vs "gross" usually means in practical terms (e.g. common deductions and that they're not a bad thing), so the number doesn't feel like a bait-and-switch.

Do not use JSON or code formatting. If you genuinely cannot find company-specific information for a section, say so honestly in one line and give general, still-useful guidance for that type of role instead of inventing specifics.
`.trim();

  const result = await generateText({
    model: researchModel,
    prompt,
  });

  return result.text;
}
