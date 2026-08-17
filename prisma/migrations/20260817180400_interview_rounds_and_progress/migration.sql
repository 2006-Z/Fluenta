/*
  Warnings:

  - You are about to drop the column `jobDescription` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `planStepsDone` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "jobDescription",
DROP COLUMN "plan",
DROP COLUMN "planStepsDone",
ADD COLUMN     "estimatedTurns" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "interviewTurnsDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rounds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "roundsDone" INTEGER NOT NULL DEFAULT 0;
