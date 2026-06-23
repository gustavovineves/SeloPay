import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AgreementStatus, User } from '@prisma/client';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { ConfirmAgreementDto } from './dto/confirm-agreement.dto';
import { NegotiateDto } from './dto/negotiate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Agreements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agreements')
export class AgreementsController {
  constructor(private agreements: AgreementsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar acordo' })
  create(@CurrentUser() user: User, @Body() dto: CreateAgreementDto) {
    return this.agreements.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar meus acordos' })
  @ApiQuery({ name: 'status', enum: AgreementStatus, required: false })
  findAll(@CurrentUser() user: User, @Query('status') status?: AgreementStatus) {
    return this.agreements.findAll(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um acordo' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.findOne(id, user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Recebedor aceita o acordo' })
  accept(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.accept(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Recebedor recusa o acordo' })
  reject(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.reject(id, user.id);
  }

  @Post(':id/simulate-deposit')
  @ApiOperation({ summary: 'Pagador deposita garantia usando saldo da carteira (apenas GUARANTEED)' })
  simulateDeposit(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.simulateDeposit(id, user.id);
  }

  @Post(':id/simulate-deposit-pix')
  @ApiOperation({ summary: 'Pagador confirma garantia via Pix simulado (sem checar saldo)' })
  simulateDepositViaPix(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.simulateDepositViaPix(id, user.id);
  }

  @Post(':id/simulate-deposit-card')
  @ApiOperation({ summary: 'Pagador deposita garantia usando Cartão SeloPay' })
  simulateDepositViaCard(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.simulateDepositViaCard(id, user.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar cumprimento do acordo' })
  confirm(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ConfirmAgreementDto,
  ) {
    return this.agreements.confirm(id, user.id, dto);
  }

  @Post(':id/negotiate')
  @ApiOperation({ summary: 'Propor renegociação com nova data' })
  proposeNegotiation(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: NegotiateDto,
  ) {
    return this.agreements.proposeNegotiation(id, user.id, dto);
  }

  @Post(':id/negotiate/accept')
  @ApiOperation({ summary: 'Aceitar renegociação proposta' })
  acceptNegotiation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.acceptNegotiation(id, user.id);
  }

  @Post(':id/negotiate/reject')
  @ApiOperation({ summary: 'Negar renegociação proposta' })
  rejectNegotiation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.rejectNegotiation(id, user.id);
  }
}
