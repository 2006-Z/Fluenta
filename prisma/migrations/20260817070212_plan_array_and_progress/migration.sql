/*
  Warnings:

  - The `plan` column on the `Conversation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "planStepsDone" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT[] DEFAULT ARRAY[]::TEXT[];
