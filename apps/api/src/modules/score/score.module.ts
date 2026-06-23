import { Global, Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';

@Global()
@Module({
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
