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
import { AdminUser, DisputeStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Login do administrador' })
  login(@Body() dto: AdminLoginDto) {
    return this.admin.login(dto);
  }

  @Get('auth/me')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do admin autenticado' })
  me(@CurrentUser() admin: AdminUser) {
    const { passwordHash: _ph, ...safe } = admin as any;
    return safe;
  }

  @Get('dashboard')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Métricas gerais do sistema' })
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get('users')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  users() {
    return this.admin.listUsers();
  }

  @Get('agreements')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os acordos' })
  agreements() {
    return this.admin.listAgreements();
  }

  @Get('disputes')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as contestações' })
  @ApiQuery({ name: 'status', enum: DisputeStatus, required: false })
  disputes(@Query('status') status?: DisputeStatus) {
    return this.admin.listDisputes(status);
  }

  @Get('disputes/:id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhe de uma contestação' })
  getDispute(@Param('id') id: string) {
    return this.admin.getDispute(id);
  }

  @Post('disputes/:id/decision')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar decisão administrativa' })
  resolveDispute(
    @CurrentUser() admin: AdminUser,
    @Param('id') id: string,
    @Body() dto: AdminDecisionDto,
  ) {
    return this.admin.resolveDispute(id, dto, admin.id);
  }
}
