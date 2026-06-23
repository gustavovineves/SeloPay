-- CreateEnum
CREATE TYPE "BlockchainEventType" AS ENUM ('AGREEMENT_CREATED', 'AGREEMENT_ACCEPTED', 'AGREEMENT_REJECTED', 'AGREEMENT_CANCELLED', 'AGREEMENT_COMPLETED', 'GUARANTEE_DEPOSITED_WALLET', 'GUARANTEE_DEPOSITED_PIX', 'GUARANTEE_DEPOSITED_CARD', 'VALUE_RELEASED', 'VALUE_REFUNDED', 'DISPUTE_OPENED', 'DISPUTE_RESPONSE_ADDED', 'ADMIN_DECISION_RELEASE', 'ADMIN_DECISION_REFUND', 'ADMIN_DECISION_RENEGOTIATION', 'RENEGOTIATION_ACCEPTED', 'PIX_DEPOSIT_CONFIRMED', 'CARD_ACTIVATED', 'CARD_LIMIT_RECALCULATED', 'CARD_LIMIT_BLOCKED', 'CARD_LIMIT_RELEASED');

-- CreateEnum
CREATE TYPE "BlockchainRecordStatus" AS ENUM ('REGISTERED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "VirtualCardStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CardTransactionType" AS ENUM ('GUARANTEE_BLOCK', 'GUARANTEE_RELEASE', 'GUARANTEE_SETTLE');

-- CreateTable
CREATE TABLE "blockchain_records" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT,
    "userId" TEXT,
    "eventType" "BlockchainEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "previousHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "status" "BlockchainRecordStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockchain_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VirtualCardStatus" NOT NULL DEFAULT 'INACTIVE',
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maskedNumber" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_transactions" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "agreementId" TEXT,
    "type" "CardTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_records_hash_key" ON "blockchain_records"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_cards_userId_key" ON "virtual_cards"("userId");

-- AddForeignKey
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_cards" ADD CONSTRAINT "virtual_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_transactions" ADD CONSTRAINT "card_transactions_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "virtual_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_transactions" ADD CONSTRAINT "card_transactions_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
