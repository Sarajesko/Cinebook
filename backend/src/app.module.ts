import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpaMiddleware } from './spa.middleware';
import { WishesModule } from './wishes/wishes.module';
import { StatsModule } from './stats/stats.module';

const publicIndex = join(__dirname, '..', '..', 'public', 'index.html');
const serveFrontend = existsSync(publicIndex);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    BooksModule,
    WishesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (serveFrontend) {
      consumer.apply(SpaMiddleware).forRoutes('{*path}');
    }
  }
}
