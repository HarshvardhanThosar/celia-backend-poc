import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthDTO {
  @ApiProperty({ description: 'Refresh token to obtain a new access token' })
  @IsString()
  refresh_token: string;
}
