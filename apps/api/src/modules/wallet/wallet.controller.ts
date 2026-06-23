import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { WalletService } from './wallet.service';
import { CreditBalanceDto } from './dto/credit-balance.dto';
import { CreatePixDepositDto } from './dto/create-pix-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar carteira do usuário logado' })
  getWallet(@CurrentUser() user: User) {
    return this.wallet.getWallet(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Histórico de movimentações' })
  getTransactions(@CurrentUser() user: User) {
    return this.wallet.getTransactions(user.id);
  }

  @Post('deposits/pix')
  @ApiOperation({ summary: 'Gerar Pix para depósito na carteira' })
  createPixDeposit(@CurrentUser() user: User, @Body() dto: CreatePixDepositDto) {
    return this.wallet.createPixDeposit(user.id, dto);
  }

  @Post('deposits/:id/simulate-confirm')
  @ApiOperation({ summary: '[Demo] Confirmar Pix de depósito na carteira' })
  confirmPixDeposit(@CurrentUser() user: User, @Param('id') depositId: string) {
    return this.wallet.confirmPixDeposit(user.id, depositId);
  }

  @Post('simulate-credit')
  @ApiOperation({ summary: '[Demo] Simular depósito de saldo' })
  simulateCredit(@CurrentUser() user: User, @Body() dto: CreditBalanceDto) {
    return this.wallet.simulateCredit(user.id, dto);
  }
}
