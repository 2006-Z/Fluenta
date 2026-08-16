-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "report" TEXT,
ADD COLUMN     "reportVerdict" TEXT;

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lesson_conversationId_idx" ON "Lesson"("conversationId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
