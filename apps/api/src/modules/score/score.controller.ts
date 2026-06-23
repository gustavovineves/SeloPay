import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScoreService } from './score.service';
import { PrismaService } from '../../prisma/prisma.service';

function scoreToLimit(score: number): number {
  if (score < 300) return 0;
  if (score < 500) return 50;
  if (score < 700) return 150;
  if (score < 850) return 300;
  return 500;
}

function scoreToTier(score: number): string {
  if (score < 300) return 'Sem limite';
  if (score < 500) return 'Bronze';
  if (score < 700) return 'Prata';
  if (score < 850) return 'Ouro';
  return 'Platina';
}

@UseGuards(AuthGuard('jwt'))
@Controller('score')
export class ScoreController {
  constructor(
    private scoreService: ScoreService,
    private prisma: PrismaService,
  ) {}

  @Get('me')
  async getMyScore(@Request() req: any) {
    const userId = req.user.sub as string;
    const [user, events] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { score: true } }),
      this.scoreService.getEvents(userId),
    ]);

    const score = user?.score ?? 0;
    const cardLimit = scoreToLimit(score);
    const tier = scoreToTier(score);

    return { score, cardLimit, tier, events };
  }
}
