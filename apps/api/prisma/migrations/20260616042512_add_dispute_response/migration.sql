-- CreateTable
CREATE TABLE "dispute_responses" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_response_evidences" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_response_evidences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dispute_responses" ADD CONSTRAINT "dispute_responses_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_responses" ADD CONSTRAINT "dispute_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_response_evidences" ADD CONSTRAINT "dispute_response_evidences_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "dispute_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
