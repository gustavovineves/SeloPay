import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SAFE_USER_SELECT } from '../../common/constants/safe-user-select';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private generateSeloKey(name: string): string {
    const firstName = name
      .split(' ')[0]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `@${firstName}${suffix}`;
  }

  private maskCpf(cpf: string): string {
    return cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2');
  }

  async register(dto: RegisterDto) {
    const [existingEmail, existingCpf] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { cpf: dto.cpf } }),
    ]);

    if (existingEmail) throw new ConflictException('E-mail já cadastrado');
    if (existingCpf) throw new ConflictException('CPF já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const cpfMasked = this.maskCpf(dto.cpf);

    let seloKey: string;
    let attempts = 0;
    do {
      seloKey = this.generateSeloKey(dto.name);
      const exists = await this.prisma.user.findUnique({ where: { seloKey } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        cpf: dto.cpf,
        cpfMasked,
        email: dto.email,
        passwordHash,
        seloKey,
        score: 100,
        wallet: { create: { availableBalance: 0, blockedBalance: 0 } },
      },
      select: SAFE_USER_SELECT,
    });

    const token = this.signToken(user.id, user.email);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('E-mail ou senha inválidos');

    const { passwordHash: _ph, cpf: _cpf, ...safeUser } = user;
    const token = this.signToken(user.id, user.email);
    return { user: safeUser, token };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });
  }

  private signToken(userId: string, email: string) {
    return this.jwt.sign(
      { sub: userId, email },
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    );
  }
}
