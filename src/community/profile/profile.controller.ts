import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpStatus,
  HttpException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard, KeycloakUser } from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileDTO } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profile_service: ProfileService) {}

  /**
   * Get user profile
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async get_profile(@KeycloakUser() user) {
    try {
      const _profile = await this.profile_service.get_profile(user.sub);
      return {
        message: 'Profile retrieved successfully!',
        data: _profile,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Update user profile
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update_profile(
    @KeycloakUser() user,
    @Body() update_profile_dto: UpdateProfileDTO,
  ) {
    try {
      const _profile = await this.profile_service.update_profile(user.sub, {
        profile_image: update_profile_dto.profile_image,
      });
      return {
        message: 'Profile updated successfully!',
        data: _profile,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
