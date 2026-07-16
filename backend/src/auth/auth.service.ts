import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const handle = dto.handle.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { handle } });
    if (existing) {
      throw new ConflictException('Ese usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { handle, passwordHash },
      select: { id: true, handle: true, createdAt: true },
    });

    return {
      user,
      accessToken: await this.signToken(user.id, user.handle),
    };
  }

  async login(dto: LoginDto) {
    const handle = dto.handle.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { handle } });
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return {
      user: {
        id: user.id,
        handle: user.handle,
        createdAt: user.createdAt,
      },
      accessToken: await this.signToken(user.id, user.handle),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, handle: true, createdAt: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private signToken(userId: string, handle: string) {
    return this.jwt.signAsync({ sub: userId, handle });
  }
}
