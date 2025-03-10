import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { AuthGuard, KeycloakUser, Public } from 'nest-keycloak-connect';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RefreshAuthDTO } from './dto/refresh-auth.dto';
import {} from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LogoutAuthDTO } from './dto/logout-auth.dto';
import { KeycloakAuthUser } from 'src/keycloak/types/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth_service: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async register(@Body() _register_auth_dto: RegisterAuthDTO) {
    try {
      const _user = await this.auth_service.register(_register_auth_dto);
      return {
        message: 'User registered successfully!',
        data: _user,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body() _login_auth_dto: LoginAuthDTO) {
    try {
      const _auth = await this.auth_service.login(
        _login_auth_dto.username,
        _login_auth_dto.password,
      );
      return {
        message: 'Logged in successfully!',
        data: _auth,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async refresh(
    @KeycloakUser() user: KeycloakAuthUser,
    @Body() _refresh_auth_dto: RefreshAuthDTO,
  ) {
    try {
      const _auth = await this.auth_service.refresh(
        _refresh_auth_dto.refresh_token,
        user,
      );
      return {
        message: 'Token refreshed successfully!',
        data: _auth,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async logout(@Body() log_out_dto: LogoutAuthDTO) {
    try {
      await this.auth_service.logout(log_out_dto.refresh_token);
      return {
        message: 'User logged out successfully!',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
