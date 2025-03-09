import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutAuthDTO {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refresh_token: string;
}
