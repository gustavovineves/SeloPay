import { Module } from '@nestjs/common';
import { VirtualCardService } from './virtual-card.service';
import { VirtualCardController } from './virtual-card.controller';

@Module({
  controllers: [VirtualCardController],
  providers: [VirtualCardService],
  exports: [VirtualCardService],
})
export class VirtualCardModule {}
