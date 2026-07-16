import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  handle!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
