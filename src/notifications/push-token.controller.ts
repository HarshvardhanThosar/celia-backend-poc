import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { PushTokenService } from './push-token.service';
import { RegisterPushTokenDTO } from './dto/register-push-token.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { create_response } from 'src/common/utils/response.util';

@Controller('push-token')
export class PushTokenController {
  constructor(private readonly push_service: PushTokenService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async register_push_token(
    @KeycloakUser() user: KeycloakAuthUser,
    @Body() token_data: RegisterPushTokenDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.push_service.register_push_token(
        user.sub,
        token_data.push_token,
      ),
      message: 'Push token registered successfully',
      status: HttpStatus.OK,
    });
  }

  @Delete('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async delete_user_push_token(
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.push_service.delete_user_push_token(user.sub),
      message: 'Push token removed successfully',
      status: HttpStatus.NO_CONTENT,
    });
  }
}
