import { Type, Transform } from 'class-transformer';
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
  ValidateIf,
} from 'class-validator';
import { Language, PurchaseCondition, ReadingState } from '@prisma/client';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  autores?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  editorial?: string;

  @IsOptional()
  @IsEnum(Language)
  lengua?: Language;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? null : String(value),
  )
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MinLength(1)
  paisEdicion?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(10)
  isbn?: string;

  @IsOptional()
  @IsEnum(ReadingState)
  estado?: ReadingState;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsEnum(PurchaseCondition)
  condicion?: PurchaseCondition;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? null : Number(value),
  )
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? null : String(value),
  )
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MinLength(1)
  moneda?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? null : Number(value),
  )
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(1)
  @Max(10)
  puntuacion?: number | null;

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
  directoresFotografia?: string[];

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bandaSonora?: string[];
}
