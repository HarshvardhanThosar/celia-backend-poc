import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { UpdateSkillDTO } from './dto/update-skill.dto';
import { SkillService } from './skills.service';
import { Roles } from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';
import { create_response } from 'src/common/utils/response.util';

@Controller('skills')
export class SkillController {
  constructor(private readonly skill_service: SkillService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_all_skills(@Res() response) {
    return create_response(response, {
      data: await this.skill_service.get_all_skills(),
      message: 'Skills fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get(':skill_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_skill_by_id(@Param('skill_id') skill_id: string, @Res() response) {
    return create_response(response, {
      data: await this.skill_service.get_skill_by_id(skill_id),
      message: 'Skill fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  async create_skill(
    @Body() create_skill_dto: CreateSkillDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.skill_service.create_skill(create_skill_dto),
      message: 'Skill created successfully',
      status: HttpStatus.CREATED,
    });
  }

  @Patch(':skill_id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async updateSkill(
    @Param('skill_id') skill_id: string,
    @Body() update_skill_dto: UpdateSkillDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.skill_service.updateSkill(skill_id, update_skill_dto),
      message: 'Skill updated successfully',
      status: HttpStatus.OK,
    });
  }

  @Delete(':skill_id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async deleteSkill(@Param('skill_id') skill_id: string, @Res() response) {
    return create_response(response, {
      data: await this.skill_service.deleteSkill(skill_id),
      message: 'Skill deleted successfully',
      status: HttpStatus.NO_CONTENT,
    });
  }
}
