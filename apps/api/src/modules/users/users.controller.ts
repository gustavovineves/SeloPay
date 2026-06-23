import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário logado' })
  me(@CurrentUser() user: User) {
    return this.users.findById(user.id);
  }

  @Get('by-key/:seloKey')
  @ApiOperation({ summary: 'Buscar usuário pela chave SeloPay' })
  byKey(@Param('seloKey') seloKey: string) {
    return this.users.findBySeloKey(seloKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Get(':id/score-events')
  @ApiOperation({ summary: 'Histórico de eventos de score do usuário' })
  scoreEvents(@Param('id') id: string) {
    return this.users.getScoreEvents(id);
  }
}
