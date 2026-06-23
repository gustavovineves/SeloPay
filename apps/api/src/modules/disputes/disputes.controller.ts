import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { disputeMulterOptions } from '../../common/config/multer.config';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private disputes: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Abrir contestação' })
  create(@CurrentUser() user: User, @Body() dto: CreateDisputeDto) {
    return this.disputes.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar minhas contestações' })
  findMine(@CurrentUser() user: User) {
    return this.disputes.findMine(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma contestação' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.disputes.findOne(id, user.id);
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Anexar evidência à contestação' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, disputeMulterOptions))
  addEvidence(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.disputes.addEvidenceFiles(id, user.id, files, baseUrl);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Responder contestação (parte contestada)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, disputeMulterOptions))
  respond(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('message') message: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!message || message.trim().length < 10) {
      throw new BadRequestException('A mensagem deve ter pelo menos 10 caracteres');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.disputes.respond(id, user.id, message.trim(), files ?? [], baseUrl);
  }
}
