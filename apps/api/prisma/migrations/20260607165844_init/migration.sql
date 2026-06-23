-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('SIMPLE', 'GUARANTEED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'PENDING_ACCEPTANCE', 'EXPIRED', 'REJECTED', 'WAITING_DEPOSIT', 'ACTIVE', 'IN_NEGOTIATION', 'IN_DISPUTE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('NO_FINANCIAL_MOVEMENT', 'WAITING_SIMULATED_DEPOSIT', 'SIMULATED_PAYMENT_PROCESSING', 'SIMULATED_PAYMENT_CONFIRMED', 'VALUE_HELD', 'VALUE_LOCKED_BY_DISPUTE', 'VALUE_RELEASED', 'REFUND_PENDING', 'VALUE_REFUNDED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('SIMULATED_DEPOSIT', 'VALUE_HELD', 'VALUE_RELEASED', 'VALUE_RECEIVED', 'SIMULATED_REFUND', 'VALUE_LOCKED_BY_DISPUTE', 'DISPUTE_RESOLVED_RELEASE', 'DISPUTE_RESOLVED_REFUND');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AdminDecisionType" AS ENUM ('RELEASE_TO_RECEIVER', 'REFUND_TO_PAYER', 'PROPOSE_RENEGOTIATION', 'REQUEST_MORE_EVIDENCE', 'KEEP_LOCKED');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SimulatedPaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConfirmationRole" AS ENUM ('PAYER', 'RECEIVER');

-- CreateEnum
CREATE TYPE "ConfirmationType" AS ENUM ('OBLIGATION_FULFILLED', 'READY_TO_RECEIVE', 'PAYMENT_MADE', 'PAYMENT_RECEIVED', 'DISPUTE_OPENED', 'RENEGOTIATION_REQUESTED');

-- CreateEnum
CREATE TYPE "ScoreEventType" AS ENUM ('AGREEMENT_COMPLETED', 'AGREEMENT_DISPUTED_RESOLVED', 'AGREEMENT_DEFAULTED', 'DISPUTE_OPENED_AGAINST_USER', 'DISPUTE_WON', 'DISPUTE_LOST', 'RENEGOTIATION_ACCEPTED', 'LATE_PAYMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cpfMasked" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "seloKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "blockedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "agreementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "type" "AgreementType" NOT NULL,
    "payerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "financialStatus" "FinancialStatus" NOT NULL DEFAULT 'NO_FINANCIAL_MOVEMENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_confirmations" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ConfirmationRole" NOT NULL,
    "confirmationType" "ConfirmationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agreement_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "adminDecision" "AdminDecisionType",
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_evidences" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_history" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiations" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "proposedDueDate" TIMESTAMP(3) NOT NULL,
    "proposedById" TEXT NOT NULL,
    "payerAccepted" BOOLEAN NOT NULL DEFAULT false,
    "receiverAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulated_payments" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SimulatedPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fakePixCode" TEXT NOT NULL,
    "fakeQrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "simulated_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ScoreEventType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "agreementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_seloKey_key" ON "users"("seloKey");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "simulated_payments_agreementId_key" ON "simulated_payments"("agreementId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_confirmations" ADD CONSTRAINT "agreement_confirmations_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_confirmations" ADD CONSTRAINT "agreement_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_evidences" ADD CONSTRAINT "dispute_evidences_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_history" ADD CONSTRAINT "dispute_history_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulated_payments" ADD CONSTRAINT "simulated_payments_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulated_payments" ADD CONSTRAINT "simulated_payments_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
