import { IsString, IsEmail, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDTO {
  @ApiProperty({ description: 'Unique username for the user' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Valid email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Password with a minimum length of 6 characters',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Consent if the user accepts the terms and conditions',
  })
  @IsBoolean()
  tnc_accepted: boolean;
}
