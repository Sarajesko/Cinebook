import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpaMiddleware } from './spa.middleware';
import { StatsModule } from './stats/stats.module';
import {
  THROTTLE_GLOBAL_LIMIT,
  THROTTLE_TTL_MS,
} from './throttle.constants';
import { WishesModule } from './wishes/wishes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: THROTTLE_TTL_MS,
        limit: THROTTLE_GLOBAL_LIMIT,
      },
    ]),
    PrismaModule,
    AuthModule,
    BooksModule,
    WishesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // SpaMiddleware comprueba si existe public/index.html
    consumer.apply(SpaMiddleware).forRoutes('{*path}');
  }
}
