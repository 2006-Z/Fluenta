import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractResumeText } from "@/lib/resume";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "text/plain",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const conversationId = formData?.get("conversationId");

  if (typeof conversationId !== "string" || !conversationId) {
    return NextResponse.json({ error: "Missing conversation" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a .txt, .pdf, .png, .jpg, or .webp file" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 5MB)" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText: string | null = null;
    try {
      extractedText = await extractResumeText(file);
    } catch (error) {
      console.error("Text extraction failed (file still saved):", error);
    }

    const attachment = await prisma.attachment.create({
      data: {
        conversationId,
        fileName: file.name,
        fileType: file.type,
        fileData: buffer,
        extractedText,
      },
      select: { id: true, fileName: true, fileType: true, createdAt: true },
    });

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Attachment upload failed:", error);
    return NextResponse.json(
      { error: "Couldn't upload that file. Please try another." },
      { status: 502 }
    );
  }
}
