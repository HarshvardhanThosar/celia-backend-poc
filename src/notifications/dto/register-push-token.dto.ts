import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterPushTokenDTO {
  @ApiProperty({
    description: 'Device push token for push notifications',
    example: 'fcm_token_12345',
  })
  @IsString()
  push_token: string;
}
