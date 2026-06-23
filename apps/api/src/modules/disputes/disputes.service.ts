import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  AgreementStatus,
  AgreementType,
  DisputeStatus,
  FinancialStatus,
  ScoreEventType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoreService } from '../score/score.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private score: ScoreService,
    private blockchain: BlockchainService,
  ) {}

  async create(dto: CreateDisputeDto, openedById: string) {
    const ag = await this.prisma.agreement.findUnique({
      where: { id: dto.agreementId },
    });
    if (!ag) throw new NotFoundException('Acordo não encontrado');
    if (ag.payerId !== openedById && ag.receiverId !== openedById) {
      throw new ForbiddenException('Você não participa deste acordo');
    }

    const allowedStatuses: string[] = [AgreementStatus.ACTIVE, AgreementStatus.IN_NEGOTIATION];
    if (!allowedStatuses.includes(ag.status)) {
      throw new BadRequestException(
        `Não é possível contestar um acordo no status ${ag.status}`,
      );
    }

    const existingOpen = await this.prisma.dispute.findFirst({
      where: {
        agreementId: dto.agreementId,
        status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
      },
    });
    if (existingOpen) {
      throw new BadRequestException('Já existe uma contestação aberta para este acordo');
    }

    const newFinancialStatus =
      ag.type === AgreementType.GUARANTEED
        ? FinancialStatus.VALUE_LOCKED_BY_DISPUTE
        : ag.financialStatus;

    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          agreementId: dto.agreementId,
          openedById,
          title: dto.title,
          description: dto.description,
          status: DisputeStatus.OPEN,
        },
      }),
      this.prisma.agreement.update({
        where: { id: dto.agreementId },
        data: {
          status: AgreementStatus.IN_DISPUTE,
          financialStatus: newFinancialStatus,
        },
      }),
    ]);

    await this.prisma.disputeHistory.create({
      data: {
        disputeId: dispute.id,
        action: 'Contestação aberta',
        performedBy: openedById,
      },
    });

    const otherUserId =
      ag.payerId === openedById ? ag.receiverId : ag.payerId;
    await this.score.recordEvent(
      otherUserId,
      ScoreEventType.DISPUTE_OPENED_AGAINST_USER,
      'Contestação aberta contra você',
      dto.agreementId,
    );

    this.blockchain.registerEvent({
      agreementId: dto.agreementId,
      userId: openedById,
      eventType: 'DISPUTE_OPENED',
      payload: { disputeId: dispute.id, title: dto.title, openedById },
    }).catch(() => {});

    return this.prisma.dispute.findUnique({
      where: { id: dispute.id },
      include: {
        evidences: true,
        history: true,
        agreement: {
          include: {
            payer: { select: { id: true, name: true, seloKey: true } },
            receiver: { select: { id: true, name: true, seloKey: true } },
          },
        },
      },
    });
  }

  async findMine(userId: string) {
    return this.prisma.dispute.findMany({
      where: {
        OR: [
          { openedById: userId },
          { agreement: { payerId: userId } },
          { agreement: { receiverId: userId } },
        ],
      },
      include: {
        evidences: true,
        agreement: {
          include: {
            payer: { select: { id: true, name: true, seloKey: true } },
            receiver: { select: { id: true, name: true, seloKey: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        evidences: true,
        history: { orderBy: { createdAt: 'asc' } },
        responses: {
          include: {
            evidences: true,
            author: { select: { id: true, name: true, seloKey: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        agreement: {
          include: {
            payer: { select: { id: true, name: true, seloKey: true, cpfMasked: true } },
            receiver: { select: { id: true, name: true, seloKey: true, cpfMasked: true } },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Contestação não encontrada');

    const { agreement } = dispute;
    if (agreement.payerId !== userId && agreement.receiverId !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta contestação');
    }
    return dispute;
  }

  async addEvidenceFiles(
    disputeId: string,
    userId: string,
    files: Express.Multer.File[],
    baseUrl: string,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { agreement: true },
    });
    if (!dispute) throw new NotFoundException('Contestação não encontrada');

    const { agreement } = dispute;
    if (agreement.payerId !== userId && agreement.receiverId !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta contestação');
    }
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Contestação já encerrada');
    }

    const evidences = await Promise.all(
      files.map((file) => {
        const fileUrl = `${baseUrl}/uploads/disputes/${file.filename}`;
        return this.prisma.disputeEvidence.create({
          data: {
            disputeId,
            fileName: file.originalname,
            fileUrl,
            fileType: file.mimetype,
            uploadedBy: userId,
          },
        });
      }),
    );

    await this.prisma.disputeHistory.create({
      data: {
        disputeId,
        action: `${files.length} evidência(s) adicionada(s)`,
        performedBy: userId,
      },
    });

    return evidences;
  }

  async respond(
    disputeId: string,
    userId: string,
    message: string,
    files: Express.Multer.File[],
    baseUrl: string,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { agreement: true, responses: true },
    });
    if (!dispute) throw new NotFoundException('Contestação não encontrada');

    const { agreement } = dispute;
    if (agreement.payerId !== userId && agreement.receiverId !== userId) {
      throw new ForbiddenException('Você não participa deste acordo');
    }
    if (dispute.openedById === userId) {
      throw new ForbiddenException('O autor da contestação não pode enviar a defesa');
    }
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Contestação já encerrada');
    }
    if (dispute.responses.some((r) => r.authorId === userId)) {
      throw new BadRequestException('Você já enviou uma resposta para esta contestação');
    }

    const response = await this.prisma.disputeResponse.create({
      data: { disputeId, authorId: userId, message },
    });

    if (files.length > 0) {
      await Promise.all(
        files.map((file) => {
          const fileUrl = `${baseUrl}/uploads/disputes/${file.filename}`;
          return this.prisma.disputeResponseEvidence.create({
            data: {
              responseId: response.id,
              fileName: file.originalname,
              fileUrl,
              fileType: file.mimetype,
            },
          });
        }),
      );
    }

    await this.prisma.$transaction([
      this.prisma.dispute.update({
        where: { id: disputeId },
        data: { status: DisputeStatus.UNDER_REVIEW },
      }),
      this.prisma.disputeHistory.create({
        data: {
          disputeId,
          action: 'Resposta enviada pela outra parte',
          performedBy: userId,
          notes: message.slice(0, 200),
        },
      }),
    ]);

    return this.findOne(disputeId, userId);
  }
}
