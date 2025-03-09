import { Body, Controller, Delete, Post } from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { PushTokenService } from './push-token.service';

@Controller('push-token')
export class PushTokenController {
  constructor(private readonly push_service: PushTokenService) {}

  @Post('register')
  async register_push_token(
    @KeycloakUser() user,
    @Body('push_token') push_token: string,
  ) {
    return this.push_service.register_push_token(user.sub, push_token);
  }

  @Delete('remove')
  async delete_user_push_token(@KeycloakUser() user) {
    return this.push_service.delete_user_push_token(user.sub);
  }
}
