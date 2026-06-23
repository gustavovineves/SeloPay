import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VirtualCardService } from './virtual-card.service';

@UseGuards(AuthGuard('jwt'))
@Controller('virtual-card')
export class VirtualCardController {
  constructor(private cardService: VirtualCardService) {}

  @Get('me')
  getCard(@Request() req: any) {
    return this.cardService.getCard(req.user.sub as string);
  }

  @Post('activate')
  activate(@Request() req: any) {
    return this.cardService.activateCard(req.user.sub as string);
  }

  @Get('transactions')
  getTransactions(@Request() req: any) {
    return this.cardService.getTransactions(req.user.sub as string);
  }

  @Post('recalculate-limit')
  recalculateLimit(@Request() req: any) {
    return this.cardService.recalculateLimit(req.user.sub as string);
  }
}
