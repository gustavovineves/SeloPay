import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { BlockchainEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface RegisterEventDto {
  agreementId?: string;
  userId?: string;
  eventType: BlockchainEventType;
  payload: Prisma.InputJsonObject;
}

@Injectable()
export class BlockchainService {
  constructor(private prisma: PrismaService) {}

  private computeHash(
    eventType: string,
    agreementId: string | null,
    payload: Record<string, unknown>,
    previousHash: string,
  ): string {
    const content = JSON.stringify({ eventType, agreementId, payload, previousHash });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async registerEvent({ agreementId, userId, eventType, payload }: RegisterEventDto): Promise<void> {
    try {
      const previousRecord = agreementId
        ? await this.prisma.blockchainRecord.findFirst({
            where: { agreementId },
            orderBy: { createdAt: 'desc' },
          })
        : null;

      const previousHash = previousRecord?.hash ?? '0'.repeat(64);
      const hash = this.computeHash(eventType, agreementId ?? null, payload, previousHash);
      const txHash = 'SELO' + hash.substring(0, 16).toUpperCase();

      await this.prisma.blockchainRecord.create({
        data: { agreementId, userId, eventType, payload, previousHash, hash, txHash },
      });
    } catch {
      // blockchain failure never blocks main flow
    }
  }

  async getAgreementProof(agreementId: string) {
    return this.prisma.blockchainRecord.findMany({
      where: { agreementId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyAgreementChain(agreementId: string): Promise<{ valid: boolean; totalEvents: number; records: unknown[] }> {
    const records = await this.prisma.blockchainRecord.findMany({
      where: { agreementId },
      orderBy: { createdAt: 'asc' },
    });

    let valid = true;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const expectedPrevHash = i === 0 ? '0'.repeat(64) : records[i - 1].hash;

      if (record.previousHash !== expectedPrevHash) {
        valid = false;
        break;
      }

      const expectedHash = this.computeHash(
        record.eventType,
        record.agreementId,
        record.payload as Record<string, unknown>,
        record.previousHash,
      );

      if (record.hash !== expectedHash) {
        valid = false;
        break;
      }
    }

    return { valid, totalEvents: records.length, records };
  }
}
