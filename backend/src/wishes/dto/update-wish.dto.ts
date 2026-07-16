import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Language, WishPriority } from '@prisma/client';

export class UpdateWishDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @IsOptional()
  @IsString()
  autores?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  isbn?: string;

  @IsOptional()
  @IsEnum(Language)
  lengua?: Language;

  @IsOptional()
  @IsString()
  paisEdicion?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsEnum(WishPriority)
  prioridad?: WishPriority;
}
