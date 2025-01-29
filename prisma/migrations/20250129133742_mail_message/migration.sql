-- CreateTable
CREATE TABLE "MailMessage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "footer" TEXT NOT NULL,
    "quizId" TEXT,

    CONSTRAINT "MailMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MailMessage" ADD CONSTRAINT "MailMessage_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
