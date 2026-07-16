import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookDto } from '../books/dto/create-book.dto';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
@UseGuards(JwtAuthGuard)
export class WishesController {
  constructor(private readonly wishes: WishesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWishDto) {
    return this.wishes.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.wishes.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.wishes.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateWishDto,
  ) {
    return this.wishes.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.wishes.remove(user.userId, id);
  }

  /** Deseado → libro en colección (recien_comprado) y cierra el deseo. */
  @Post(':id/to-collection')
  toCollection(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateBookDto,
  ) {
    return this.wishes.toCollection(user.userId, id, dto);
  }
}
