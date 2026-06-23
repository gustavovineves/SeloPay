-- CreateEnum
CREATE TYPE "PixDepositStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'FAILED');

-- CreateTable
CREATE TABLE "pix_deposits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PixDepositStatus" NOT NULL DEFAULT 'PENDING',
    "qrCodePayload" TEXT NOT NULL,
    "copyPasteCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "pix_deposits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pix_deposits" ADD CONSTRAINT "pix_deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
