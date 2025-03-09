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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async register(@Body() _register_auth_dto: RegisterAuthDTO) {
    try {
      const _user = await this.authService.register(_register_auth_dto);
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
      const _auth = await this.authService.login(
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async refresh(
    @KeycloakUser() user,
    @Body() _refresh_auth_dto: RefreshAuthDTO,
  ) {
    try {
      const _auth = await this.authService.refresh(
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
}
