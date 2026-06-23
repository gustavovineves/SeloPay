export interface User {
  id: string;
  name: string;
  email: string;
  cpfMasked: string;
  seloKey: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  blockedBalance: number;
  updatedAt: string;
}

export type WalletTransactionType =
  | 'SIMULATED_DEPOSIT'
  | 'VALUE_HELD'
  | 'VALUE_RELEASED'
  | 'VALUE_RECEIVED'
  | 'SIMULATED_REFUND'
  | 'VALUE_LOCKED_BY_DISPUTE'
  | 'DISPUTE_RESOLVED_RELEASE'
  | 'DISPUTE_RESOLVED_REFUND';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  agreementId?: string;
  createdAt: string;
}

export type AgreementType = 'GUARANTEED';

export type PixDepositStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'FAILED';

export interface PixDeposit {
  id: string;
  userId: string;
  amount: number;
  status: PixDepositStatus;
  qrCodePayload: string;
  copyPasteCode: string;
  expiresAt: string;
  createdAt: string;
  confirmedAt?: string;
}

export type SimulatedPaymentStatus = 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'FAILED';

export interface SimulatedPayment {
  id: string;
  agreementId: string;
  payerId: string;
  amount: number;
  status: SimulatedPaymentStatus;
  fakePixCode: string;
  fakeQrCode: string;
  createdAt: string;
  confirmedAt?: string;
}

export type AgreementStatus =
  | 'DRAFT'
  | 'PENDING_ACCEPTANCE'
  | 'EXPIRED'
  | 'REJECTED'
  | 'WAITING_DEPOSIT'
  | 'ACTIVE'
  | 'IN_NEGOTIATION'
  | 'IN_DISPUTE'
  | 'COMPLETED'
  | 'CANCELLED';

export type FinancialStatus =
  | 'NO_FINANCIAL_MOVEMENT'
  | 'WAITING_SIMULATED_DEPOSIT'
  | 'SIMULATED_PAYMENT_PROCESSING'
  | 'SIMULATED_PAYMENT_CONFIRMED'
  | 'VALUE_HELD'
  | 'VALUE_LOCKED_BY_DISPUTE'
  | 'VALUE_RELEASED'
  | 'REFUND_PENDING'
  | 'VALUE_REFUNDED';

export interface AgreementUser {
  id: string;
  name: string;
  seloKey: string;
  cpfMasked?: string;
}

export interface Agreement {
  id: string;
  title?: string;
  description?: string;
  type: AgreementType;
  status: AgreementStatus;
  financialStatus: FinancialStatus;
  amount: number;
  dueDate: string;
  expiresAt: string;
  acceptedAt?: string;
  completedAt?: string;
  payerId: string;
  receiverId: string;
  payer: AgreementUser;
  receiver: AgreementUser;
  createdAt: string;
  updatedAt: string;
  simulatedPayment?: SimulatedPayment | null;
  confirmations?: AgreementConfirmation[];
  negotiations?: Negotiation[];
  disputes?: Dispute[];
}

export type ConfirmationRole = 'PAYER' | 'RECEIVER';

export type ConfirmationType =
  | 'OBLIGATION_FULFILLED'
  | 'READY_TO_RECEIVE'
  | 'DISPUTE_OPENED'
  | 'RENEGOTIATION_REQUESTED';

export interface AgreementConfirmation {
  id: string;
  agreementId: string;
  userId: string;
  role: ConfirmationRole;
  confirmationType: ConfirmationType;
  createdAt: string;
}

export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Negotiation {
  id: string;
  agreementId: string;
  proposedDueDate: string;
  proposedById: string;
  payerAccepted: boolean;
  receiverAccepted: boolean;
  status: NegotiationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface DisputeResponseEvidence {
  id: string;
  responseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface DisputeResponse {
  id: string;
  disputeId: string;
  authorId: string;
  message: string;
  createdAt: string;
  author: { id: string; name: string };
  evidences: DisputeResponseEvidence[];
}

export interface Dispute {
  id: string;
  agreementId: string;
  openedById: string;
  title: string;
  description: string;
  status: DisputeStatus;
  adminDecision?: string;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  responses?: DisputeResponse[];
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DisputeHistory {
  id: string;
  disputeId: string;
  action: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

export type AdminDecisionType =
  | 'RELEASE_TO_RECEIVER'
  | 'REFUND_TO_PAYER'
  | 'PROPOSE_RENEGOTIATION'
  | 'REQUEST_MORE_EVIDENCE';

export interface AdminDisputeAgreement {
  id: string;
  type: AgreementType;
  status: AgreementStatus;
  financialStatus: FinancialStatus;
  amount: number;
  dueDate: string;
  payer: AgreementUser & { cpfMasked?: string };
  receiver: AgreementUser & { cpfMasked?: string };
}

export interface AdminDispute {
  id: string;
  agreementId: string;
  openedById: string;
  title: string;
  description: string;
  status: DisputeStatus;
  adminDecision?: AdminDecisionType;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  evidences: DisputeEvidence[];
  history: DisputeHistory[];
  responses: DisputeResponse[];
  agreement: AdminDisputeAgreement;
  openedBy: { id: string; name: string; seloKey: string };
}

export type BlockchainEventType =
  | 'AGREEMENT_CREATED'
  | 'AGREEMENT_ACCEPTED'
  | 'AGREEMENT_REJECTED'
  | 'AGREEMENT_CANCELLED'
  | 'AGREEMENT_COMPLETED'
  | 'GUARANTEE_DEPOSITED_WALLET'
  | 'GUARANTEE_DEPOSITED_PIX'
  | 'GUARANTEE_DEPOSITED_CARD'
  | 'VALUE_RELEASED'
  | 'VALUE_REFUNDED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESPONSE_ADDED'
  | 'ADMIN_DECISION_RELEASE'
  | 'ADMIN_DECISION_REFUND'
  | 'ADMIN_DECISION_RENEGOTIATION'
  | 'RENEGOTIATION_ACCEPTED'
  | 'PIX_DEPOSIT_CONFIRMED'
  | 'CARD_ACTIVATED'
  | 'CARD_LIMIT_RECALCULATED'
  | 'CARD_LIMIT_BLOCKED'
  | 'CARD_LIMIT_RELEASED';

export type BlockchainRecordStatus = 'REGISTERED' | 'CONFIRMED';

export interface BlockchainRecord {
  id: string;
  agreementId?: string | null;
  userId?: string | null;
  eventType: BlockchainEventType;
  payload: Record<string, unknown>;
  previousHash: string;
  hash: string;
  txHash: string;
  status: BlockchainRecordStatus;
  createdAt: string;
}

export type VirtualCardStatus = 'INACTIVE' | 'ACTIVE' | 'BLOCKED';

export type CardTransactionType = 'GUARANTEE_BLOCK' | 'GUARANTEE_RELEASE' | 'GUARANTEE_SETTLE';

export interface CardTransaction {
  id: string;
  cardId: string;
  agreementId?: string | null;
  type: CardTransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface VirtualCard {
  id: string;
  userId: string;
  status: VirtualCardStatus;
  creditLimit: number;
  usedLimit: number;
  maskedNumber: string;
  holderName: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  transactions?: CardTransaction[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreEvent {
  id: string;
  userId: string;
  type: string;
  delta: number;
  description: string;
  agreementId?: string;
  createdAt: string;
}
