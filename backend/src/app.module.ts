import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { PrismaModule } from './prisma/prisma.module';
import { WishesModule } from './wishes/wishes.module';
import { StatsModule } from './stats/stats.module';

const publicPath = join(__dirname, '..', '..', 'public');
const serveFrontend = existsSync(join(publicPath, 'index.html'));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(serveFrontend
      ? [
          ServeStaticModule.forRoot({
            rootPath: publicPath,
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    BooksModule,
    WishesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
