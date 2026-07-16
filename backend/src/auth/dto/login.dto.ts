import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  handle!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
