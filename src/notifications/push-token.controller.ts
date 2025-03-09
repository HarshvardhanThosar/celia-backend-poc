import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, KeycloakUser } from 'nest-keycloak-connect';
import { PushTokenService } from './push-token.service';
import { RegisterPushTokenDTO } from './dto/register-push-token.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('push-token')
export class PushTokenController {
  constructor(private readonly push_service: PushTokenService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async register_push_token(
    @KeycloakUser() user,
    @Body() token_data: RegisterPushTokenDTO,
  ) {
    console.log(token_data);
    return this.push_service.register_push_token(
      user.sub,
      token_data.push_token,
    );
  }

  @Delete('remove')
  async delete_user_push_token(@KeycloakUser() user) {
    return this.push_service.delete_user_push_token(user.sub);
  }
}
