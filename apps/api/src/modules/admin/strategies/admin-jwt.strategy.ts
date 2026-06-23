import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

interface AdminJwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ADMIN_JWT_SECRET ?? 'selopay_admin_jwt_secret_dev_only',
    });
  }

  async validate(payload: AdminJwtPayload) {
    if (!payload.isAdmin) throw new UnauthorizedException('Acesso negado');
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });
    if (!admin) throw new UnauthorizedException('Admin não encontrado');
    return admin;
  }
}
