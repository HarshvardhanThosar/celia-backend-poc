import {
  Controller,
  Get,
  Put,
  Body,
  HttpStatus,
  HttpException,
  HttpCode,
  Res,
  Post,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { KeycloakUser } from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { create_response } from 'src/common/utils/response.util';
import { RegisterSkillsDTO } from './dto/register-skills.dto';

@Controller('profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profile_service: ProfileService) {}

  /**
   * Get user profile
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_profile(@KeycloakUser() user: KeycloakAuthUser, @Res() response) {
    try {
      const {
        email,
        email_verified,
        family_name,
        given_name,
        name,
        preferred_username,
      } = user;
      const _profile = await this.profile_service.get_profile(user.sub);

      // Calculate streak
      const streak = await this.profile_service.calculate_attendance_streak(
        user.sub,
      );

      return create_response(response, {
        status: HttpStatus.OK,
        message: 'Profile retrieved successfully!',
        data: {
          email,
          email_verified,
          family_name,
          given_name,
          name,
          preferred_username,
          ..._profile,
          streak,
        },
      });
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Update user profile
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async update_profile(
    @KeycloakUser() user: KeycloakAuthUser,
    @Body() update_profile_dto: UpdateProfileDTO,
    @Res() response,
  ) {
    try {
      const {
        email,
        email_verified,
        family_name,
        given_name,
        name,
        preferred_username,
      } = user;
      const _profile = await this.profile_service.update_profile(user.sub, {
        profile_image: update_profile_dto.profile_image,
      });
      return create_response(response, {
        status: HttpStatus.OK,
        message: 'Profile updated successfully!',
        data: {
          email,
          email_verified,
          family_name,
          given_name,
          name,
          preferred_username,
          ..._profile,
        },
      });
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('register-skills')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async register_skills(
    @KeycloakUser() user: KeycloakAuthUser,
    @Body() { skill_ids }: RegisterSkillsDTO,
    @Res() response,
  ) {
    try {
      const updated_profile =
        await this.profile_service.register_preferred_skills(
          user.sub,
          skill_ids,
        );
      return create_response(response, {
        status: HttpStatus.OK,
        message: 'Skills registered successfully!',
        data: updated_profile.skills,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
