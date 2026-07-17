import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  THROTTLE_ISBN_LIMIT,
  THROTTLE_TTL_MS,
} from '../throttle.constants';
import { BooksService } from './books.service';
import { CheckDuplicateDto } from './dto/check-duplicate.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookDto) {
    return this.books.create(user.userId, dto);
  }

  @Post('check-duplicate')
  checkDuplicate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CheckDuplicateDto,
  ) {
    return this.books.checkDuplicate(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.books.findAll(user.userId);
  }

  @Throttle({ default: { limit: THROTTLE_ISBN_LIMIT, ttl: THROTTLE_TTL_MS } })
  @Get('isbn-lookup')
  lookupIsbn(@Query('isbn') isbn: string) {
    return this.books.lookupIsbn(isbn ?? '');
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.books.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.books.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.books.remove(user.userId, id);
  }
}
