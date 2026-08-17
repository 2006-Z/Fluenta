import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";

const openaiCompatible = createOpenAI({
  baseURL: env.AI_BASE_URL,
  apiKey: env.AI_API_KEY,
});

export const chatModel = openaiCompatible.chat("x-ai/grok-latest");
export const researchModel = openaiCompatible.chat("perplexity/sonar-pro");
