import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VirtualCardStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

export function scoreToCardLimit(score: number): number {
  if (score < 300) return 0;
  if (score < 500) return 50;
  if (score < 700) return 150;
  if (score < 850) return 300;
  return 500;
}

@Injectable()
export class VirtualCardService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  private generateMaskedNumber(userId: string): string {
    const seed = userId.replace(/[^a-zA-Z0-9]/g, '');
    const raw = parseInt(seed.slice(-8), 36);
    const last4 = String(Math.abs(raw) % 10000).padStart(4, '0');
    return `**** **** **** ${last4}`;
  }

  async getCard(userId: string) {
    return this.prisma.virtualCard.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async activateCard(userId: string) {
    const existing = await this.prisma.virtualCard.findUnique({ where: { userId } });

    if (existing && existing.status === VirtualCardStatus.ACTIVE) {
      throw new BadRequestException('Cartão já está ativo');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const creditLimit = scoreToCardLimit(user.score);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    let card;
    if (existing) {
      card = await this.prisma.virtualCard.update({
        where: { userId },
        data: { status: VirtualCardStatus.ACTIVE, creditLimit },
        include: { transactions: true },
      });
    } else {
      card = await this.prisma.virtualCard.create({
        data: {
          userId,
          status: VirtualCardStatus.ACTIVE,
          creditLimit,
          usedLimit: 0,
          maskedNumber: this.generateMaskedNumber(userId),
          holderName: user.name.toUpperCase(),
          expiresAt,
        },
        include: { transactions: true },
      });
    }

    this.blockchain.registerEvent({
      userId,
      eventType: 'CARD_ACTIVATED',
      payload: { cardId: card.id, creditLimit, holderName: card.holderName },
    }).catch(() => {});

    return card;
  }

  async recalculateLimit(userId: string) {
    const card = await this.prisma.virtualCard.findUnique({ where: { userId } });
    if (!card) throw new NotFoundException('Cartão não encontrado');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const newLimit = scoreToCardLimit(user.score);

    const updated = await this.prisma.virtualCard.update({
      where: { userId },
      data: { creditLimit: newLimit },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    this.blockchain.registerEvent({
      userId,
      eventType: 'CARD_LIMIT_RECALCULATED',
      payload: { cardId: card.id, oldLimit: card.creditLimit, newLimit, score: user.score },
    }).catch(() => {});

    return updated;
  }

  async getTransactions(userId: string) {
    const card = await this.prisma.virtualCard.findUnique({ where: { userId } });
    if (!card) return [];
    return this.prisma.cardTransaction.findMany({
      where: { cardId: card.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
