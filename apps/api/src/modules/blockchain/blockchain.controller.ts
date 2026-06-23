import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlockchainService } from './blockchain.service';

@UseGuards(AuthGuard('jwt'))
@Controller('agreements')
export class BlockchainController {
  constructor(private blockchain: BlockchainService) {}

  @Get(':id/blockchain')
  getProof(@Param('id') id: string) {
    return this.blockchain.getAgreementProof(id);
  }

  @Get(':id/blockchain/verify')
  verify(@Param('id') id: string) {
    return this.blockchain.verifyAgreementChain(id);
  }
}
