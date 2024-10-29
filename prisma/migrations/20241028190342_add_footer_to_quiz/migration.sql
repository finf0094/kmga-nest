-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'MAIL_SENDED';

-- DropForeignKey
ALTER TABLE "selected_answers" DROP CONSTRAINT "selected_answers_questionId_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "feed_back" TEXT,
ADD COLUMN     "sendedTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "position" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "emailTitle" TEXT NOT NULL DEFAULT 'Dear Customer',
ADD COLUMN     "footer" TEXT;

-- CreateIndex
CREATE INDEX "questions_position_idx" ON "questions"("position");

-- AddForeignKey
ALTER TABLE "selected_answers" ADD CONSTRAINT "selected_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
