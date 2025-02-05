/*
  Warnings:

  - You are about to drop the column `description` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `emailTitle` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `footer` on the `quizzes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "description",
DROP COLUMN "emailTitle",
DROP COLUMN "footer";
