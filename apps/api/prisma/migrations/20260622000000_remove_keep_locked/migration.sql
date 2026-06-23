-- Remove KEEP_LOCKED from AdminDecisionType enum
-- First null out any existing rows that use this value
UPDATE "disputes" SET "adminDecision" = NULL WHERE "adminDecision" = 'KEEP_LOCKED';

-- Recreate the enum without KEEP_LOCKED
ALTER TYPE "AdminDecisionType" RENAME TO "AdminDecisionType_old";
CREATE TYPE "AdminDecisionType" AS ENUM ('RELEASE_TO_RECEIVER', 'REFUND_TO_PAYER', 'PROPOSE_RENEGOTIATION', 'REQUEST_MORE_EVIDENCE');
ALTER TABLE "disputes" ALTER COLUMN "adminDecision" TYPE "AdminDecisionType" USING "adminDecision"::text::"AdminDecisionType";
DROP TYPE "AdminDecisionType_old";
