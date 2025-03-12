import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutAuthDTO {
  @ApiProperty({ description: 'Refresh token to revoke access' })
  @IsString()
  refresh_token: string;
}
