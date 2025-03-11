import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { PushTokenService } from './push-token.service';
import { RegisterPushTokenDTO } from './dto/register-push-token.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { KeycloakAuthUser } from 'src/keycloak/types/user';

@Controller('push-token')
export class PushTokenController {
  constructor(private readonly push_service: PushTokenService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async register_push_token(
    @KeycloakUser() user: KeycloakAuthUser,
    @Body() token_data: RegisterPushTokenDTO,
  ) {
    return this.push_service.register_push_token(
      user.sub,
      token_data.push_token,
    );
  }

  @Delete('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async delete_user_push_token(@KeycloakUser() user: KeycloakAuthUser) {
    return this.push_service.delete_user_push_token(user.sub);
  }
}
