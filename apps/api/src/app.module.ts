import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';
import { ScoreModule } from './modules/score/score.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { VirtualCardModule } from './modules/virtual-card/virtual-card.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    ScoreModule,
    BlockchainModule,
    AuthModule,
    UsersModule,
    WalletModule,
    AgreementsModule,
    DisputesModule,
    AdminModule,
    VirtualCardModule,
  ],
})
export class AppModule {}
