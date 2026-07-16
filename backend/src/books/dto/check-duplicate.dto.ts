import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

/** Body para aviso no bloqueante «¿Ya tienes este?» */
export class CheckDuplicateDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  isbn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  autores?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  editorial?: string;

  /** Al editar, excluir el propio libro del match */
  @IsOptional()
  @IsString()
  excludeBookId?: string;
}
