import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  AgreementStatus,
  CardTransactionType,
  ConfirmationRole,
  ConfirmationType,
  FinancialStatus,
  NegotiationStatus,
  ScoreEventType,
  SimulatedPaymentStatus,
  VirtualCardStatus,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoreService } from '../score/score.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { ConfirmAgreementDto } from './dto/confirm-agreement.dto';
import { NegotiateDto } from './dto/negotiate.dto';

const AGREEMENT_INCLUDE = {
  payer: { select: { id: true, name: true, seloKey: true, cpfMasked: true, score: true } },
  receiver: { select: { id: true, name: true, seloKey: true, cpfMasked: true, score: true } },
  simulatedPayment: true,
  confirmations: true,
  disputes: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      responses: {
        include: {
          evidences: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
  },
  negotiations: { orderBy: { createdAt: 'desc' as const }, take: 1 },
};

@Injectable()
export class AgreementsService {
  constructor(
    private prisma: PrismaService,
    private score: ScoreService,
    private blockchain: BlockchainService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────

  private fakePixCode(agreementId: string, amount: number): string {
    const id = agreementId.replace(/-/g, '').slice(0, 25).padEnd(25, '0');
    return `00020126580014br.gov.bcb.pix0136${id}5204000053039865802BR5907SeloPay6009SAO PAULO620705${String(amount).padStart(3, '0')}6304SELO`;
  }

  private fakeQrCode(agreementId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SELOPAY-FAKE-${agreementId.slice(0, 8).toUpperCase()}`;
  }

  private async markExpiredIfNeeded(agreementId: string) {
    const now = new Date();
    const ag = await this.prisma.agreement.findUnique({ where: { id: agreementId } });
    if (
      ag &&
      ag.status === AgreementStatus.PENDING_ACCEPTANCE &&
      ag.expiresAt < now
    ) {
      await this.prisma.agreement.update({
        where: { id: agreementId },
        data: { status: AgreementStatus.EXPIRED },
      });
    }
  }

  private async requireParticipant(agreementId: string, userId: string) {
    const ag = await this.prisma.agreement.findUnique({ where: { id: agreementId } });
    if (!ag) throw new NotFoundException('Acordo não encontrado');
    if (ag.payerId !== userId && ag.receiverId !== userId) {
      throw new ForbiddenException('Você não participa deste acordo');
    }
    return ag;
  }

  // ─── Create ─────────────────────────────────────────────────────────

  async create(dto: CreateAgreementDto, payerId: string) {
    const receiverKey = dto.receiverSeloKey.startsWith('@')
      ? dto.receiverSeloKey
      : `@${dto.receiverSeloKey}`;

    const receiver = await this.prisma.user.findUnique({
      where: { seloKey: receiverKey },
    });
    if (!receiver) throw new NotFoundException('Chave SeloPay não encontrada');
    if (receiver.id === payerId) {
      throw new BadRequestException('Você não pode criar um acordo consigo mesmo');
    }

    const dueDate = new Date(dto.dueDate);
    if (dueDate <= new Date()) {
      throw new BadRequestException('A data de vencimento deve ser futura');
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const ag = await this.prisma.agreement.create({
      data: {
        type: dto.type,
        payerId,
        receiverId: receiver.id,
        amount: dto.amount,
        dueDate,
        status: AgreementStatus.PENDING_ACCEPTANCE,
        financialStatus: FinancialStatus.NO_FINANCIAL_MOVEMENT,
        expiresAt,
      },
      include: AGREEMENT_INCLUDE,
    });

    this.blockchain.registerEvent({
      agreementId: ag.id,
      userId: payerId,
      eventType: 'AGREEMENT_CREATED',
      payload: { type: ag.type, amount: ag.amount, payerId, receiverId: receiver.id },
    }).catch(() => {});

    return ag;
  }

  // ─── List ────────────────────────────────────────────────────────────

  async findAll(userId: string, status?: AgreementStatus) {
    const now = new Date();

    await this.prisma.agreement.updateMany({
      where: {
        OR: [{ payerId: userId }, { receiverId: userId }],
        status: AgreementStatus.PENDING_ACCEPTANCE,
        expiresAt: { lt: now },
      },
      data: { status: AgreementStatus.EXPIRED },
    });

    return this.prisma.agreement.findMany({
      where: {
        OR: [{ payerId: userId }, { receiverId: userId }],
        ...(status ? { status } : {}),
      },
      include: AGREEMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Detail ──────────────────────────────────────────────────────────

  async findOne(id: string, userId: string) {
    await this.markExpiredIfNeeded(id);
    const ag = await this.prisma.agreement.findUnique({
      where: { id },
      include: {
        ...AGREEMENT_INCLUDE,
        disputes: { orderBy: { createdAt: 'desc' as const } },
        negotiations: { orderBy: { createdAt: 'desc' as const } },
        confirmations: true,
      },
    });
    if (!ag) throw new NotFoundException('Acordo não encontrado');
    if (ag.payerId !== userId && ag.receiverId !== userId) {
      throw new ForbiddenException('Você não participa deste acordo');
    }
    return ag;
  }

  // ─── Accept ──────────────────────────────────────────────────────────

  async accept(id: string, userId: string) {
    await this.markExpiredIfNeeded(id);
    const ag = await this.requireParticipant(id, userId);

    if (ag.receiverId !== userId) {
      throw new ForbiddenException('Apenas o recebedor pode aceitar o acordo');
    }
    if (ag.status !== AgreementStatus.PENDING_ACCEPTANCE) {
      throw new BadRequestException(`Acordo não pode ser aceito no status ${ag.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.agreement.update({
        where: { id },
        data: {
          status: AgreementStatus.WAITING_DEPOSIT,
          financialStatus: FinancialStatus.WAITING_SIMULATED_DEPOSIT,
          acceptedAt: new Date(),
        },
      }),
      this.prisma.simulatedPayment.create({
        data: {
          agreementId: id,
          payerId: ag.payerId,
          amount: ag.amount,
          status: SimulatedPaymentStatus.PENDING,
          fakePixCode: this.fakePixCode(id, ag.amount),
          fakeQrCode: this.fakeQrCode(id),
        },
      }),
    ]);

    this.blockchain.registerEvent({
      agreementId: id,
      userId,
      eventType: 'AGREEMENT_ACCEPTED',
      payload: { type: 'GUARANTEED', status: 'WAITING_DEPOSIT' },
    }).catch(() => {});

    return this.prisma.agreement.findUnique({ where: { id }, include: AGREEMENT_INCLUDE });
  }

  // ─── Reject ──────────────────────────────────────────────────────────

  async reject(id: string, userId: string) {
    await this.markExpiredIfNeeded(id);
    const ag = await this.requireParticipant(id, userId);

    if (ag.receiverId !== userId) {
      throw new ForbiddenException('Apenas o recebedor pode recusar o acordo');
    }
    if (ag.status !== AgreementStatus.PENDING_ACCEPTANCE) {
      throw new BadRequestException(`Acordo não pode ser recusado no status ${ag.status}`);
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: { status: AgreementStatus.REJECTED },
      include: AGREEMENT_INCLUDE,
    });

    this.blockchain.registerEvent({
      agreementId: id,
      userId,
      eventType: 'AGREEMENT_REJECTED',
      payload: { rejectedAt: new Date().toISOString() },
    }).catch(() => {});

    return updated;
  }

  // ─── Simulate Deposit via Wallet (GUARANTEED only) ───────────────────

  async simulateDeposit(id: string, userId: string) {
    const ag = await this.requireParticipant(id, userId);

    if (ag.payerId !== userId) {
      throw new ForbiddenException('Apenas o pagador pode realizar o depósito');
    }
    if (ag.status !== AgreementStatus.WAITING_DEPOSIT) {
      throw new BadRequestException(`Depósito não permitido no status ${ag.status}`);
    }

    const payerWallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!payerWallet) throw new NotFoundException('Carteira do pagador não encontrada');

    if (payerWallet.availableBalance < ag.amount) {
      throw new BadRequestException(
        `Saldo insuficiente. Disponível: R$ ${payerWallet.availableBalance.toFixed(2)}, necessário: R$ ${ag.amount.toFixed(2)}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: payerWallet.id },
        data: {
          availableBalance: { decrement: ag.amount },
          blockedBalance: { increment: ag.amount },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: payerWallet.id,
          type: WalletTransactionType.VALUE_HELD,
          amount: ag.amount,
          description: 'Valor guardado em acordo com garantia',
          agreementId: id,
        },
      }),
      this.prisma.simulatedPayment.update({
        where: { agreementId: id },
        data: { status: SimulatedPaymentStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      this.prisma.agreement.update({
        where: { id },
        data: { status: AgreementStatus.ACTIVE, financialStatus: FinancialStatus.VALUE_HELD },
      }),
    ]);

    this.blockchain.registerEvent({
      agreementId: id,
      userId,
      eventType: 'GUARANTEE_DEPOSITED_WALLET',
      payload: { amount: ag.amount, source: 'wallet' },
    }).catch(() => {});

    return this.prisma.agreement.findUnique({ where: { id }, include: AGREEMENT_INCLUDE });
  }

  // ─── Simulate Deposit via Pix (GUARANTEED, sem checar saldo) ────────

  async simulateDepositViaPix(id: string, userId: string) {
    const ag = await this.requireParticipant(id, userId);

    if (ag.payerId !== userId) {
      throw new ForbiddenException('Apenas o pagador pode realizar o depósito');
    }
    if (ag.status !== AgreementStatus.WAITING_DEPOSIT) {
      throw new BadRequestException(`Depósito não permitido no status ${ag.status}`);
    }

    const payerWallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!payerWallet) throw new NotFoundException('Carteira do pagador não encontrada');

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: payerWallet.id },
        data: { blockedBalance: { increment: ag.amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: payerWallet.id,
          type: WalletTransactionType.VALUE_HELD,
          amount: ag.amount,
          description: 'Garantia via Pix depositada',
          agreementId: id,
        },
      }),
      this.prisma.simulatedPayment.update({
        where: { agreementId: id },
        data: { status: SimulatedPaymentStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      this.prisma.agreement.update({
        where: { id },
        data: { status: AgreementStatus.ACTIVE, financialStatus: FinancialStatus.VALUE_HELD },
      }),
    ]);

    this.blockchain.registerEvent({
      agreementId: id,
      userId,
      eventType: 'GUARANTEE_DEPOSITED_PIX',
      payload: { amount: ag.amount, source: 'pix' },
    }).catch(() => {});

    return this.prisma.agreement.findUnique({ where: { id }, include: AGREEMENT_INCLUDE });
  }

  // ─── Simulate Deposit via Card (GUARANTEED) ──────────────────────────

  async simulateDepositViaCard(id: string, userId: string) {
    const ag = await this.requireParticipant(id, userId);

    if (ag.payerId !== userId) {
      throw new ForbiddenException('Apenas o pagador pode realizar o depósito');
    }
    if (ag.status !== AgreementStatus.WAITING_DEPOSIT) {
      throw new BadRequestException(`Depósito não permitido no status ${ag.status}`);
    }

    const card = await this.prisma.virtualCard.findUnique({ where: { userId } });
    if (!card || card.status !== VirtualCardStatus.ACTIVE) {
      throw new BadRequestException('Cartão SeloPay não está ativo');
    }

    const available = card.creditLimit - card.usedLimit;
    if (available < ag.amount) {
      throw new BadRequestException(
        `Limite insuficiente. Disponível: R$ ${available.toFixed(2)}, necessário: R$ ${ag.amount.toFixed(2)}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.virtualCard.update({
        where: { id: card.id },
        data: { usedLimit: { increment: ag.amount } },
      }),
      this.prisma.cardTransaction.create({
        data: {
          cardId: card.id,
          agreementId: id,
          type: CardTransactionType.GUARANTEE_BLOCK,
          amount: ag.amount,
          description: 'Garantia bloqueada no Cartão SeloPay',
        },
      }),
      this.prisma.simulatedPayment.update({
        where: { agreementId: id },
        data: { status: SimulatedPaymentStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      this.prisma.agreement.update({
        where: { id },
        data: { status: AgreementStatus.ACTIVE, financialStatus: FinancialStatus.VALUE_HELD },
      }),
    ]);

    this.blockchain.registerEvent({
      agreementId: id,
      userId,
      eventType: 'GUARANTEE_DEPOSITED_CARD',
      payload: { amount: ag.amount, source: 'card', cardId: card.id },
    }).catch(() => {});

    return this.prisma.agreement.findUnique({ where: { id }, include: AGREEMENT_INCLUDE });
  }

  // ─── Confirm ─────────────────────────────────────────────────────────

  async confirm(id: string, userId: string, dto: ConfirmAgreementDto) {
    const ag = await this.requireParticipant(id, userId);

    if (ag.status !== AgreementStatus.ACTIVE) {
      throw new BadRequestException(`Não é possível confirmar no status ${ag.status}`);
    }

    const isPayerRole = ag.payerId === userId;
    const role: ConfirmationRole = isPayerRole
      ? ConfirmationRole.PAYER
      : ConfirmationRole.RECEIVER;

    if (isPayerRole && dto.confirmationType !== ConfirmationType.OBLIGATION_FULFILLED) {
      throw new BadRequestException('O pagador deve usar OBLIGATION_FULFILLED');
    }
    if (!isPayerRole && dto.confirmationType !== ConfirmationType.READY_TO_RECEIVE) {
      throw new BadRequestException('O recebedor deve usar READY_TO_RECEIVE');
    }

    const existing = await this.prisma.agreementConfirmation.findFirst({
      where: { agreementId: id, userId, role },
    });
    if (existing) {
      throw new BadRequestException('Você já confirmou este acordo');
    }

    await this.prisma.agreementConfirmation.create({
      data: { agreementId: id, userId, role, confirmationType: dto.confirmationType },
    });

    // ── Ambos confirmam → liberar valor ──────────────────────────────
    const confirmations = await this.prisma.agreementConfirmation.findMany({
      where: { agreementId: id },
    });

    const payerConfirmed = confirmations.some(
      (c) => c.role === ConfirmationRole.PAYER && c.confirmationType === ConfirmationType.OBLIGATION_FULFILLED,
    );
    const receiverConfirmed = confirmations.some(
      (c) => c.role === ConfirmationRole.RECEIVER && c.confirmationType === ConfirmationType.READY_TO_RECEIVE,
    );

    if (payerConfirmed && receiverConfirmed) {
      await this.releaseValue(ag.id, ag.payerId, ag.receiverId, ag.amount);
    }

    return this.findOne(id, userId);
  }

  // ─── Release Value (interno) ──────────────────────────────────────────

  async releaseValue(agreementId: string, payerId: string, receiverId: string, amount: number) {
    // Check if guarantee was via card
    const cardTx = await this.prisma.cardTransaction.findFirst({
      where: { agreementId, type: CardTransactionType.GUARANTEE_BLOCK },
    });

    if (cardTx) {
      // Card guarantee: settle card, no wallet movement for payer
      const [receiverWallet] = await Promise.all([
        this.prisma.wallet.findUnique({ where: { userId: receiverId } }),
      ]);
      if (!receiverWallet) throw new NotFoundException('Carteira do recebedor não encontrada');

      await this.prisma.$transaction([
        this.prisma.cardTransaction.create({
          data: {
            cardId: cardTx.cardId,
            agreementId,
            type: CardTransactionType.GUARANTEE_SETTLE,
            amount,
            description: 'Crédito liquidado — acordo concluído',
          },
        }),
        this.prisma.wallet.update({
          where: { id: receiverWallet.id },
          data: { availableBalance: { increment: amount } },
        }),
        this.prisma.walletTransaction.create({
          data: {
            walletId: receiverWallet.id,
            type: WalletTransactionType.VALUE_RECEIVED,
            amount,
            description: 'Valor recebido de acordo com garantia (cartão)',
            agreementId,
          },
        }),
        this.prisma.agreement.update({
          where: { id: agreementId },
          data: { status: AgreementStatus.COMPLETED, financialStatus: FinancialStatus.VALUE_RELEASED, completedAt: new Date() },
        }),
      ]);
    } else {
      // Wallet/Pix guarantee: existing flow
      const [payerWallet, receiverWallet] = await Promise.all([
        this.prisma.wallet.findUnique({ where: { userId: payerId } }),
        this.prisma.wallet.findUnique({ where: { userId: receiverId } }),
      ]);
      if (!payerWallet || !receiverWallet) throw new NotFoundException('Carteiras não encontradas');

      await this.prisma.$transaction([
        this.prisma.wallet.update({
          where: { id: payerWallet.id },
          data: { blockedBalance: { decrement: amount } },
        }),
        this.prisma.walletTransaction.create({
          data: { walletId: payerWallet.id, type: WalletTransactionType.VALUE_RELEASED, amount, description: 'Valor liberado do acordo com garantia', agreementId },
        }),
        this.prisma.wallet.update({
          where: { id: receiverWallet.id },
          data: { availableBalance: { increment: amount } },
        }),
        this.prisma.walletTransaction.create({
          data: { walletId: receiverWallet.id, type: WalletTransactionType.VALUE_RECEIVED, amount, description: 'Valor recebido de acordo com garantia', agreementId },
        }),
        this.prisma.agreement.update({
          where: { id: agreementId },
          data: { status: AgreementStatus.COMPLETED, financialStatus: FinancialStatus.VALUE_RELEASED, completedAt: new Date() },
        }),
      ]);
    }

    await Promise.all([
      this.score.recordEvent(payerId, ScoreEventType.AGREEMENT_COMPLETED, 'Acordo com garantia concluído', agreementId),
      this.score.recordEvent(receiverId, ScoreEventType.AGREEMENT_COMPLETED, 'Acordo com garantia concluído', agreementId),
    ]);

    this.blockchain.registerEvent({
      agreementId,
      eventType: 'VALUE_RELEASED',
      payload: { amount, payerId, receiverId, completedAt: new Date().toISOString() },
    }).catch(() => {});
  }

  // ─── Negotiate ────────────────────────────────────────────────────────

  async proposeNegotiation(id: string, userId: string, dto: NegotiateDto) {
    const ag = await this.requireParticipant(id, userId);

    const allowedStatuses: string[] = [AgreementStatus.ACTIVE, AgreementStatus.IN_NEGOTIATION];
    if (!allowedStatuses.includes(ag.status)) {
      throw new BadRequestException(`Renegociação não permitida no status ${ag.status}`);
    }

    const proposedDueDate = new Date(dto.proposedDueDate);
    if (proposedDueDate <= new Date()) {
      throw new BadRequestException('A nova data deve ser futura');
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [negotiation] = await this.prisma.$transaction([
      this.prisma.negotiation.create({
        data: {
          agreementId: id,
          proposedDueDate,
          proposedById: userId,
          payerAccepted: ag.payerId === userId,
          receiverAccepted: ag.receiverId === userId,
          status: NegotiationStatus.PENDING,
          expiresAt,
        },
      }),
      this.prisma.agreement.update({
        where: { id },
        data: { status: AgreementStatus.IN_NEGOTIATION },
      }),
    ]);

    return negotiation;
  }

  async acceptNegotiation(agreementId: string, userId: string) {
    const ag = await this.requireParticipant(agreementId, userId);

    if (ag.status !== AgreementStatus.IN_NEGOTIATION) {
      throw new BadRequestException('Não há renegociação em andamento');
    }

    const negotiation = await this.prisma.negotiation.findFirst({
      where: { agreementId, status: NegotiationStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
    if (!negotiation) throw new NotFoundException('Renegociação não encontrada');

    if (negotiation.proposedById === userId) {
      throw new BadRequestException('Você já propôs esta renegociação');
    }

    const isPayer = ag.payerId === userId;
    const data = isPayer ? { payerAccepted: true } : { receiverAccepted: true };

    const updated = await this.prisma.negotiation.update({ where: { id: negotiation.id }, data });

    const bothAccepted = updated.payerAccepted && updated.receiverAccepted;
    if (bothAccepted) {
      const restoredFinancialStatus =
        ag.financialStatus === FinancialStatus.VALUE_LOCKED_BY_DISPUTE
          ? FinancialStatus.VALUE_HELD
          : ag.financialStatus;

      await this.prisma.$transaction([
        this.prisma.negotiation.update({ where: { id: negotiation.id }, data: { status: NegotiationStatus.ACCEPTED } }),
        this.prisma.agreement.update({
          where: { id: agreementId },
          data: { status: AgreementStatus.ACTIVE, dueDate: negotiation.proposedDueDate, financialStatus: restoredFinancialStatus },
        }),
      ]);

      await Promise.all([
        this.score.recordEvent(ag.payerId, ScoreEventType.RENEGOTIATION_ACCEPTED, 'Renegociação aceita por ambas as partes', agreementId),
        this.score.recordEvent(ag.receiverId, ScoreEventType.RENEGOTIATION_ACCEPTED, 'Renegociação aceita por ambas as partes', agreementId),
      ]);

      this.blockchain.registerEvent({
        agreementId,
        userId,
        eventType: 'RENEGOTIATION_ACCEPTED',
        payload: { newDueDate: negotiation.proposedDueDate.toISOString() },
      }).catch(() => {});
    }

    return this.findOne(agreementId, userId);
  }

  async rejectNegotiation(agreementId: string, userId: string) {
    const ag = await this.requireParticipant(agreementId, userId);

    if (ag.status !== AgreementStatus.IN_NEGOTIATION) {
      throw new BadRequestException('Não há renegociação em andamento');
    }

    const negotiation = await this.prisma.negotiation.findFirst({
      where: { agreementId, status: NegotiationStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
    if (!negotiation) throw new NotFoundException('Renegociação não encontrada');

    if (negotiation.proposedById === userId) {
      throw new BadRequestException('Você não pode negar sua própria proposta');
    }

    await this.prisma.$transaction([
      this.prisma.negotiation.update({
        where: { id: negotiation.id },
        data: { status: NegotiationStatus.REJECTED },
      }),
      this.prisma.agreement.update({
        where: { id: agreementId },
        data: { status: AgreementStatus.ACTIVE },
      }),
    ]);

    return this.findOne(agreementId, userId);
  }
}
