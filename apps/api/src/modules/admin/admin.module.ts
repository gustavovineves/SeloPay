import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET ?? 'selopay_admin_jwt_secret_dev_only',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AdminService, AdminJwtStrategy],
  controllers: [AdminController],
})
export class AdminModule {}
