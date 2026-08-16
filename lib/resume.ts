import { generateText } from "ai";
import { PDFParse } from "pdf-parse";
import { chatModel } from "@/lib/ai";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (IMAGE_TYPES.includes(file.type)) {
    const result = await generateText({
      model: chatModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe the relevant resume/CV content from this image as plain text — name, experience, skills, education, projects. Do not add commentary or formatting, just the extracted content.",
            },
            { type: "file", mediaType: file.type, data: buffer.toString("base64") },
          ],
        },
      ],
    });
    return result.text;
  }

  throw new Error("Unsupported file type");
}
