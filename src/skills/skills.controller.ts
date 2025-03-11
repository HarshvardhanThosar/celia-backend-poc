import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { UpdateSkillDTO } from './dto/update-skill.dto';
import { SkillService } from './skills.service';
import { Roles } from 'nest-keycloak-connect';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('skills')
export class SkillController {
  constructor(private readonly skill_service: SkillService) {}

  @Get()
  @ApiBearerAuth()
  async get_all_skills() {
    return this.skill_service.get_all_skills();
  }

  @Get(':skill_id')
  @ApiBearerAuth()
  async get_skill_by_id(@Param('skill_id') skill_id: string) {
    return this.skill_service.get_skill_by_id(skill_id);
  }

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  async create_skill(@Body() create_skill_dto: CreateSkillDTO) {
    return this.skill_service.create_skill(create_skill_dto);
  }

  @Patch(':skill_id')
  @Roles('admin')
  @ApiBearerAuth()
  async updateSkill(
    @Param('skill_id') skill_id: string,
    @Body() update_skill_dto: UpdateSkillDTO,
  ) {
    return this.skill_service.updateSkill(skill_id, update_skill_dto);
  }

  @Delete(':skill_id')
  @Roles('admin')
  @ApiBearerAuth()
  async deleteSkill(@Param('skill_id') skill_id: string) {
    return this.skill_service.deleteSkill(skill_id);
  }
}
