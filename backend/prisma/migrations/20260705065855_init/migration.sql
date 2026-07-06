-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('User', 'Assistance');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('Pre', 'InProgress', 'Done');

-- CreateTable
CREATE TABLE "InterView" (
    "id" TEXT NOT NULL,
    "metaData" JSONB NOT NULL,
    "status" "InterviewStatus" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InterView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "interviewId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
