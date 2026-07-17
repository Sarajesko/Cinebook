import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

function isPostgresUrl(url: string): boolean {
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

function needsSsl(url: string): boolean {
  return /sslmode=require|neon\.tech|render\.com/i.test(url);
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL') ?? 'file:./dev.db';

    if (isPostgresUrl(url)) {
      const pool = new Pool({
        connectionString: url,
        ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
      });
      super({ adapter: new PrismaPg(pool) });
    } else {
      super({ adapter: new PrismaBetterSqlite3({ url }) });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
