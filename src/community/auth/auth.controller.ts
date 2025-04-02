import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  HttpCode,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { KeycloakUser, Public } from 'nest-keycloak-connect';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RefreshAuthDTO } from './dto/refresh-auth.dto';
import {} from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LogoutAuthDTO } from './dto/logout-auth.dto';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { create_response } from 'src/common/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth_service: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async register(@Body() _register_auth_dto: RegisterAuthDTO, @Res() response) {
    const { tnc_accepted } = _register_auth_dto;
    if (!tnc_accepted)
      throw new HttpException(
        'Cannot register without accepting the terms and conditions.',
        HttpStatus.BAD_REQUEST,
      );
    try {
      const _user = await this.auth_service.register(_register_auth_dto);
      return create_response(response, {
        status: HttpStatus.CREATED,
        message: 'User registered successfully!',
        data: _user,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body() _login_auth_dto: LoginAuthDTO, @Res() response) {
    try {
      const _auth = await this.auth_service.login(_login_auth_dto);
      return create_response(response, {
        status: HttpStatus.OK,
        message: 'Logged in successfully!',
        data: _auth,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async refresh(@Body() _refresh_auth_dto: RefreshAuthDTO, @Res() response) {
    try {
      const _auth = await this.auth_service.refresh(_refresh_auth_dto);
      return create_response(response, {
        status: HttpStatus.OK,
        message: 'Token refreshed successfully!',
        data: _auth,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async logout(@Body() _log_out_dto: LogoutAuthDTO, @Res() response) {
    try {
      await this.auth_service.logout(_log_out_dto);
      return create_response(response, {
        status: HttpStatus.OK,
        message: 'User logged out successfully!',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
