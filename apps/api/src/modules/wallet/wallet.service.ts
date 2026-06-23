import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PixDepositStatus, WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreditBalanceDto } from './dto/credit-balance.dto';
import { CreatePixDepositDto } from './dto/create-pix-deposit.dto';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, seloKey: true } },
      },
    });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        agreement: {
          select: {
            id: true,
            type: true,
            amount: true,
            payer: { select: { name: true, seloKey: true } },
            receiver: { select: { name: true, seloKey: true } },
          },
        },
      },
    });
  }

  private pixQrUrl(seed: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SELOPAY-DEP-${seed.slice(0, 8).toUpperCase()}`;
  }

  private pixCopyCode(seed: string, amount: number): string {
    const id = seed.replace(/-/g, '').slice(0, 25).padEnd(25, '0');
    return `00020126580014br.gov.bcb.pix0136${id}5204000053039865802BR5907SeloPay6009SAO PAULO620705${String(Math.round(amount)).padStart(3, '0')}6304DPIX`;
  }

  async createPixDeposit(userId: string, dto: CreatePixDepositDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    const seed = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    const deposit = await this.prisma.pixDeposit.create({
      data: {
        userId,
        amount: dto.amount,
        qrCodePayload: this.pixQrUrl(seed),
        copyPasteCode: this.pixCopyCode(seed, dto.amount),
        expiresAt,
      },
    });

    return {
      id: deposit.id,
      amount: deposit.amount,
      status: deposit.status,
      qrCodePayload: deposit.qrCodePayload,
      copyPasteCode: deposit.copyPasteCode,
      expiresAt: deposit.expiresAt,
    };
  }

  async confirmPixDeposit(userId: string, depositId: string) {
    const deposit = await this.prisma.pixDeposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new NotFoundException('Depósito não encontrado');
    if (deposit.userId !== userId) throw new ForbiddenException('Depósito não pertence a este usuário');
    if (deposit.status === PixDepositStatus.CONFIRMED) {
      throw new BadRequestException('Depósito já confirmado');
    }
    if (deposit.status !== PixDepositStatus.PENDING) {
      throw new BadRequestException('Depósito expirado ou cancelado');
    }
    if (deposit.expiresAt < new Date()) {
      await this.prisma.pixDeposit.update({
        where: { id: depositId },
        data: { status: PixDepositStatus.EXPIRED },
      });
      throw new BadRequestException('Depósito expirado. Gere um novo Pix.');
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: { increment: deposit.amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.SIMULATED_DEPOSIT,
          amount: deposit.amount,
          description: 'Depósito via Pix',
        },
      }),
      this.prisma.pixDeposit.update({
        where: { id: depositId },
        data: { status: PixDepositStatus.CONFIRMED, confirmedAt: new Date() },
      }),
    ]);

    this.blockchain.registerEvent({
      userId,
      eventType: 'PIX_DEPOSIT_CONFIRMED',
      payload: { depositId, amount: deposit.amount, availableBalance: updatedWallet.availableBalance },
    }).catch(() => {});

    return {
      message: 'Depósito confirmado com sucesso',
      availableBalance: updatedWallet.availableBalance,
      amount: deposit.amount,
    };
  }

  async simulateCredit(userId: string, dto: CreditBalanceDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    const description = dto.description ?? `Depósito simulado de R$ ${dto.amount.toFixed(2)}`;

    const [updated] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: { increment: dto.amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.SIMULATED_DEPOSIT,
          amount: dto.amount,
          description,
        },
      }),
    ]);

    return {
      message: 'Crédito simulado adicionado com sucesso',
      availableBalance: updated.availableBalance,
    };
  }
}
