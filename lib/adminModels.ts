import { prisma } from "@/lib/prisma";

export type FieldType = "text" | "textarea" | "boolean" | "int" | "readonly";

export interface FieldDef {
  name: string;
  type: FieldType;
}

export interface ModelDef {
  key: string;
  label: string;
  fields: FieldDef[];
  orderBy: { field: string; direction: "asc" | "desc" };
}

export const ADMIN_MODELS: Record<string, ModelDef> = {
  conversation: {
    key: "conversation",
    label: "Conversations",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "userId", type: "text" },
      { name: "title", type: "text" },
      { name: "company", type: "text" },
      { name: "role", type: "text" },
      { name: "interviewerName", type: "text" },
      { name: "resumeText", type: "textarea" },
      { name: "research", type: "textarea" },
      { name: "rounds", type: "readonly" },
      { name: "roundsDone", type: "int" },
      { name: "estimatedTurns", type: "int" },
      { name: "interviewTurnsDone", type: "int" },
      { name: "contextSummary", type: "textarea" },
      { name: "summarizedUpToCount", type: "int" },
      { name: "status", type: "text" },
      { name: "createdAt", type: "readonly" },
      { name: "updatedAt", type: "readonly" },
    ],
  },
  message: {
    key: "message",
    label: "Messages",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "conversationId", type: "text" },
      { name: "role", type: "text" },
      { name: "content", type: "textarea" },
      { name: "isOnboarding", type: "boolean" },
      { name: "createdAt", type: "readonly" },
    ],
  },
  attachment: {
    key: "attachment",
    label: "Attachments",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "conversationId", type: "text" },
      { name: "fileName", type: "text" },
      { name: "fileType", type: "text" },
      { name: "extractedText", type: "textarea" },
      { name: "createdAt", type: "readonly" },
    ],
  },
  messageFeedback: {
    key: "messageFeedback",
    label: "Message Feedback",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "messageId", type: "text" },
      { name: "rating", type: "text" },
      { name: "comment", type: "textarea" },
      { name: "reported", type: "boolean" },
      { name: "reportReason", type: "textarea" },
      { name: "createdAt", type: "readonly" },
      { name: "updatedAt", type: "readonly" },
    ],
  },
  otpCode: {
    key: "otpCode",
    label: "OTP Codes",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "userId", type: "text" },
      { name: "code", type: "text" },
      { name: "purpose", type: "text" },
      { name: "expiresAt", type: "readonly" },
      { name: "createdAt", type: "readonly" },
    ],
  },
  passwordResetToken: {
    key: "passwordResetToken",
    label: "Password Reset Tokens",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "userId", type: "text" },
      { name: "token", type: "readonly" },
      { name: "expiresAt", type: "readonly" },
      { name: "createdAt", type: "readonly" },
    ],
  },
  pendingSignup: {
    key: "pendingSignup",
    label: "Pending Signups",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "email", type: "text" },
      { name: "code", type: "text" },
      { name: "verified", type: "boolean" },
      { name: "expiresAt", type: "readonly" },
      { name: "createdAt", type: "readonly" },
    ],
  },
  lesson: {
    key: "lesson",
    label: "Lessons",
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", type: "readonly" },
      { name: "conversationId", type: "text" },
      { name: "format", type: "text" },
      { name: "title", type: "text" },
      { name: "content", type: "textarea" },
      { name: "createdAt", type: "readonly" },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDelegate(modelKey: string): any {
  const delegates: Record<string, unknown> = {
    conversation: prisma.conversation,
    message: prisma.message,
    attachment: prisma.attachment,
    messageFeedback: prisma.messageFeedback,
    otpCode: prisma.otpCode,
    passwordResetToken: prisma.passwordResetToken,
    pendingSignup: prisma.pendingSignup,
    lesson: prisma.lesson,
  };
  return delegates[modelKey];
}

export function editableFieldNames(model: ModelDef): string[] {
  return model.fields.filter((f) => f.type !== "readonly").map((f) => f.name);
}
