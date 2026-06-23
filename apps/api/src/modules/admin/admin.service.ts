import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  AdminDecisionType,
  AgreementStatus,
  AgreementType,
  CardTransactionType,
  DisputeStatus,
  FinancialStatus,
  NegotiationStatus,
  ScoreEventType,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoreService } from '../score/score.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private score: ScoreService,
    private blockchain: BlockchainService,
  ) {}

  // ─── Auth ────────────────────────────────────────────────────────────

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwt.sign(
      { sub: admin.id, email: admin.email, isAdmin: true },
      {
        secret: process.env.ADMIN_JWT_SECRET ?? 'selopay_admin_jwt_secret_dev_only',
        expiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? '1d',
      },
    );

    const { passwordHash: _ph, ...safeAdmin } = admin;
    return { admin: safeAdmin, token };
  }

  // ─── Dashboard ───────────────────────────────────────────────────────

  async getDashboard() {
    const [totalUsers, totalAgreements, activeAgreements, completedAgreements, totalDisputes, openDisputes] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.agreement.count(),
        this.prisma.agreement.count({ where: { status: AgreementStatus.ACTIVE } }),
        this.prisma.agreement.count({ where: { status: AgreementStatus.COMPLETED } }),
        this.prisma.dispute.count(),
        this.prisma.dispute.count({ where: { status: DisputeStatus.OPEN } }),
      ]);

    return { totalUsers, totalAgreements, activeAgreements, completedAgreements, totalDisputes, openDisputes };
  }

  // ─── Users ───────────────────────────────────────────────────────────

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, name: true, cpfMasked: true, email: true, seloKey: true, score: true, createdAt: true,
        wallet: { select: { availableBalance: true, blockedBalance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Agreements ──────────────────────────────────────────────────────

  async listAgreements() {
    return this.prisma.agreement.findMany({
      include: {
        payer: { select: { id: true, name: true, seloKey: true } },
        receiver: { select: { id: true, name: true, seloKey: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Disputes ────────────────────────────────────────────────────────

  async listDisputes(status?: DisputeStatus) {
    return this.prisma.dispute.findMany({
      where: status ? { status } : undefined,
      include: {
        evidences: true,
        history: { orderBy: { createdAt: 'asc' } },
        responses: {
          include: {
            evidences: true,
            author: { select: { id: true, name: true, seloKey: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        agreement: {
          include: {
            payer: { select: { id: true, name: true, seloKey: true } },
            receiver: { select: { id: true, name: true, seloKey: true } },
          },
        },
        openedBy: { select: { id: true, name: true, seloKey: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDispute(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        evidences: true,
        history: { orderBy: { createdAt: 'asc' } },
        responses: {
          include: {
            evidences: true,
            author: { select: { id: true, name: true, seloKey: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        agreement: {
          include: {
            payer: { select: { id: true, name: true, seloKey: true, cpfMasked: true } },
            receiver: { select: { id: true, name: true, seloKey: true, cpfMasked: true } },
            simulatedPayment: true,
          },
        },
        openedBy: { select: { id: true, name: true, seloKey: true } },
      },
    });
    if (!dispute) throw new NotFoundException('Contestação não encontrada');
    return dispute;
  }

  // ─── Decision ────────────────────────────────────────────────────────

  async resolveDispute(disputeId: string, dto: AdminDecisionDto, adminId: string) {
    const dispute = await this.getDispute(disputeId);
    const ag = dispute.agreement;

    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Contestação já resolvida');
    }

    const historyAction = `Decisão: ${dto.decision}${dto.notes ? ` — ${dto.notes}` : ''}`;

    switch (dto.decision) {
      case AdminDecisionType.RELEASE_TO_RECEIVER:
        await this.executeReleaseToReceiver(ag, dispute.id, adminId, historyAction, dto.notes);
        break;
      case AdminDecisionType.REFUND_TO_PAYER:
        await this.executeRefundToPayer(ag, dispute.id, adminId, historyAction, dto.notes);
        break;
      case AdminDecisionType.PROPOSE_RENEGOTIATION:
        await this.executeRenegotiation(ag, dispute.id, adminId, historyAction, dto.notes);
        break;
      case AdminDecisionType.REQUEST_MORE_EVIDENCE:
        await this.prisma.$transaction([
          this.prisma.dispute.update({ where: { id: dispute.id }, data: { status: DisputeStatus.UNDER_REVIEW, adminNotes: dto.notes } }),
          this.prisma.disputeHistory.create({ data: { disputeId: dispute.id, action: historyAction, performedBy: adminId, notes: dto.notes } }),
        ]);
        break;
      default:
        throw new BadRequestException('Decisão inválida');
    }

    return this.getDispute(disputeId);
  }

  // ─── Private helpers ─────────────────────────────────────────────────

  private async executeReleaseToReceiver(ag: any, disputeId: string, adminId: string, action: string, notes?: string) {
    const isGuaranteed = ag.type === AgreementType.GUARANTEED;

    await this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: { status: DisputeStatus.RESOLVED, adminDecision: AdminDecisionType.RELEASE_TO_RECEIVER, adminNotes: notes, resolvedAt: new Date() },
      });
      await tx.disputeHistory.create({ data: { disputeId, action, performedBy: adminId, notes } });

      if (isGuaranteed) {
        // Check if guarantee was via card
        const cardTx = await tx.cardTransaction.findFirst({
          where: { agreementId: ag.id, type: CardTransactionType.GUARANTEE_BLOCK },
        });

        if (cardTx) {
          // Card guarantee: settle card, credit receiver
          const receiverWallet = await tx.wallet.findUnique({ where: { userId: ag.receiverId } });
          await tx.cardTransaction.create({
            data: { cardId: cardTx.cardId, agreementId: ag.id, type: CardTransactionType.GUARANTEE_SETTLE, amount: ag.amount, description: 'Crédito liquidado — decisão administrativa' },
          });
          await tx.wallet.update({ where: { id: receiverWallet.id }, data: { availableBalance: { increment: ag.amount } } });
          await tx.walletTransaction.create({
            data: { walletId: receiverWallet.id, type: WalletTransactionType.VALUE_RECEIVED, amount: ag.amount, description: 'Valor recebido por decisão administrativa (cartão)', agreementId: ag.id },
          });
        } else {
          // Wallet/Pix guarantee: existing flow
          const payerWallet = await tx.wallet.findUnique({ where: { userId: ag.payerId } });
          const receiverWallet = await tx.wallet.findUnique({ where: { userId: ag.receiverId } });
          await tx.wallet.update({ where: { id: payerWallet.id }, data: { blockedBalance: { decrement: ag.amount } } });
          await tx.walletTransaction.create({ data: { walletId: payerWallet.id, type: WalletTransactionType.DISPUTE_RESOLVED_RELEASE, amount: ag.amount, description: 'Valor liberado por decisão administrativa', agreementId: ag.id } });
          await tx.wallet.update({ where: { id: receiverWallet.id }, data: { availableBalance: { increment: ag.amount } } });
          await tx.walletTransaction.create({ data: { walletId: receiverWallet.id, type: WalletTransactionType.VALUE_RECEIVED, amount: ag.amount, description: 'Valor recebido por decisão administrativa', agreementId: ag.id } });
        }

        await tx.agreement.update({ where: { id: ag.id }, data: { status: AgreementStatus.COMPLETED, financialStatus: FinancialStatus.VALUE_RELEASED, completedAt: new Date() } });
      } else {
        await tx.agreement.update({ where: { id: ag.id }, data: { status: AgreementStatus.COMPLETED, completedAt: new Date() } });
      }
    });

    await Promise.all([
      this.score.recordEvent(ag.receiverId, ScoreEventType.DISPUTE_WON, 'Contestação resolvida a seu favor', ag.id),
      this.score.recordEvent(ag.payerId, ScoreEventType.DISPUTE_LOST, 'Contestação decidida contra você', ag.id),
    ]);

    this.blockchain.registerEvent({
      agreementId: ag.id,
      eventType: 'ADMIN_DECISION_RELEASE',
      payload: { decision: 'RELEASE_TO_RECEIVER', adminId, disputeId, notes: notes ?? null },
    }).catch(() => {});
  }

  private async executeRefundToPayer(ag: any, disputeId: string, adminId: string, action: string, notes?: string) {
    const isGuaranteed = ag.type === AgreementType.GUARANTEED;

    await this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: { status: DisputeStatus.RESOLVED, adminDecision: AdminDecisionType.REFUND_TO_PAYER, adminNotes: notes, resolvedAt: new Date() },
      });
      await tx.disputeHistory.create({ data: { disputeId, action, performedBy: adminId, notes } });

      if (isGuaranteed) {
        const cardTx = await tx.cardTransaction.findFirst({
          where: { agreementId: ag.id, type: CardTransactionType.GUARANTEE_BLOCK },
        });

        if (cardTx) {
          // Card guarantee: release limit back to card
          await tx.cardTransaction.create({
            data: { cardId: cardTx.cardId, agreementId: ag.id, type: CardTransactionType.GUARANTEE_RELEASE, amount: ag.amount, description: 'Limite restituído — decisão administrativa' },
          });
          await tx.virtualCard.update({ where: { id: cardTx.cardId }, data: { usedLimit: { decrement: ag.amount } } });
        } else {
          // Wallet/Pix guarantee: refund to payer
          const payerWallet = await tx.wallet.findUnique({ where: { userId: ag.payerId } });
          await tx.wallet.update({ where: { id: payerWallet.id }, data: { blockedBalance: { decrement: ag.amount }, availableBalance: { increment: ag.amount } } });
          await tx.walletTransaction.create({ data: { walletId: payerWallet.id, type: WalletTransactionType.DISPUTE_RESOLVED_REFUND, amount: ag.amount, description: 'Reembolso por decisão administrativa', agreementId: ag.id } });
        }

        await tx.agreement.update({ where: { id: ag.id }, data: { status: AgreementStatus.CANCELLED, financialStatus: FinancialStatus.VALUE_REFUNDED } });
      } else {
        await tx.agreement.update({ where: { id: ag.id }, data: { status: AgreementStatus.CANCELLED } });
      }
    });

    await Promise.all([
      this.score.recordEvent(ag.payerId, ScoreEventType.DISPUTE_WON, 'Contestação resolvida a seu favor (reembolso)', ag.id),
      this.score.recordEvent(ag.receiverId, ScoreEventType.DISPUTE_LOST, 'Contestação decidida contra você', ag.id),
    ]);

    this.blockchain.registerEvent({
      agreementId: ag.id,
      eventType: 'ADMIN_DECISION_REFUND',
      payload: { decision: 'REFUND_TO_PAYER', adminId, disputeId, notes: notes ?? null },
    }).catch(() => {});
  }

  private async executeRenegotiation(ag: any, disputeId: string, adminId: string, action: string, notes?: string) {
    const newDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.dispute.update({ where: { id: disputeId }, data: { status: DisputeStatus.UNDER_REVIEW, adminDecision: AdminDecisionType.PROPOSE_RENEGOTIATION, adminNotes: notes } }),
      this.prisma.disputeHistory.create({ data: { disputeId, action, performedBy: adminId, notes } }),
      this.prisma.negotiation.create({
        data: { agreementId: ag.id, proposedDueDate: newDueDate, proposedById: ag.payerId, payerAccepted: true, receiverAccepted: false, status: NegotiationStatus.PENDING, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) },
      }),
      this.prisma.agreement.update({ where: { id: ag.id }, data: { status: AgreementStatus.IN_NEGOTIATION } }),
    ]);

    this.blockchain.registerEvent({
      agreementId: ag.id,
      eventType: 'ADMIN_DECISION_RENEGOTIATION',
      payload: { decision: 'PROPOSE_RENEGOTIATION', adminId, disputeId, newDueDate: newDueDate.toISOString() },
    }).catch(() => {});
  }
}
