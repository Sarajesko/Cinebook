import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('registers a new user and returns token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      handle: 'cinefilo',
      createdAt: new Date('2026-01-01'),
    });

    const result = await service.register({
      handle: 'Cinefilo',
      password: 'secreto1',
    });

    expect(result.accessToken).toBe('test-token');
    expect(result.user.handle).toBe('cinefilo');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('rejects duplicate handle', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({ handle: 'cinefilo', password: 'secreto1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid password', async () => {
    const passwordHash = await bcrypt.hash('secreto1', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      handle: 'cinefilo',
      passwordHash,
      createdAt: new Date('2026-01-01'),
    });

    const result = await service.login({
      handle: 'cinefilo',
      password: 'secreto1',
    });
    expect(result.accessToken).toBe('test-token');
  });

  it('rejects bad password', async () => {
    const passwordHash = await bcrypt.hash('secreto1', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      handle: 'cinefilo',
      passwordHash,
      createdAt: new Date('2026-01-01'),
    });

    await expect(
      service.login({ handle: 'cinefilo', password: 'wrongpass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
