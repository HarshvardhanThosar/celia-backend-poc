import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterAuthDTO {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
