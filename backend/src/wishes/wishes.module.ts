import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BooksModule } from '../books/books.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}
