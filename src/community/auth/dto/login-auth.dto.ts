import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDTO {
  @ApiProperty({ description: 'Unique username for the user' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password with a minimum length of 6 characters',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
