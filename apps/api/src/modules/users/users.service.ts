import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SAFE_USER_SELECT } from '../../common/constants/safe-user-select';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findBySeloKey(seloKey: string) {
    const key = seloKey.startsWith('@') ? seloKey : `@${seloKey}`;
    const user = await this.prisma.user.findUnique({
      where: { seloKey: key },
      select: SAFE_USER_SELECT,
    });
    if (!user) throw new NotFoundException('Chave SeloPay não encontrada');
    return user;
  }

  async getScoreEvents(userId: string) {
    await this.findById(userId);
    return this.prisma.scoreEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
