import { Injectable } from '@nestjs/common';
import { ScoreEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const SCORE_DELTAS: Record<ScoreEventType, number> = {
  AGREEMENT_COMPLETED: 5,
  AGREEMENT_DISPUTED_RESOLVED: 3,
  AGREEMENT_DEFAULTED: -15,
  DISPUTE_OPENED_AGAINST_USER: -5,
  DISPUTE_WON: 5,
  DISPUTE_LOST: -10,
  RENEGOTIATION_ACCEPTED: 2,
  LATE_PAYMENT: -3,
};

@Injectable()
export class ScoreService {
  constructor(private prisma: PrismaService) {}

  async recordEvent(
    userId: string,
    type: ScoreEventType,
    description: string,
    agreementId?: string,
  ) {
    const delta = SCORE_DELTAS[type];

    await this.prisma.$transaction([
      this.prisma.scoreEvent.create({
        data: { userId, type, delta, description, agreementId },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { score: { increment: delta } },
      }),
    ]);
  }

  async getEvents(userId: string) {
    return this.prisma.scoreEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
