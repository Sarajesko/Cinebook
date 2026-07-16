import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Language, PurchaseCondition, ReadingState } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  titulo!: string;

  @IsString()
  @MinLength(1)
  autores!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(2100)
  anio!: number;

  @IsString()
  @MinLength(1)
  editorial!: string;

  @IsEnum(Language)
  lengua!: Language;

  @IsString()
  @MinLength(1)
  paisEdicion!: string;

  @IsString()
  @MinLength(10)
  isbn!: string;

  @IsEnum(ReadingState)
  estado!: ReadingState;

  @IsDateString()
  fechaCompra!: string;

  @IsEnum(PurchaseCondition)
  condicion!: PurchaseCondition;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  moneda?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  puntuacion!: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  caratula?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  dondeComprado?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  directores?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guionistas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actores?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productores?: string[];
}
