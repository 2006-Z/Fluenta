/*
  Warnings:

  - You are about to drop the column `reportVerdict` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "reportVerdict",
ADD COLUMN     "companyGapDetected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hireProbability" INTEGER,
ADD COLUMN     "researchExplainedBeforeInterview" BOOLEAN NOT NULL DEFAULT false;
