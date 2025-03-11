import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { SkillStatus } from './enums/skill-status.enum';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { UpdateSkillDTO } from './dto/update-skill.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill) private skill_repository: Repository<Skill>,
  ) {}

  async get_all_skills() {
    console.log('Here');
    return await this.skill_repository.find();
  }

  async get_skill_by_id(skill_id: string) {
    const skill = await this.skill_repository.findOneBy({
      _id: new ObjectId(skill_id),
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async create_skill(create_skill_dto: CreateSkillDTO) {
    const newSkill = this.skill_repository.create({
      ...create_skill_dto,
      status: SkillStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.skill_repository.save(newSkill);
  }

  async updateSkill(skill_id: string, update_skill_dto: UpdateSkillDTO) {
    await this.skill_repository.update(skill_id, {
      ...update_skill_dto,
      updated_at: new Date(),
    });
    const updatedSkill = await this.skill_repository.findOneBy({
      _id: new ObjectId(skill_id),
    });
    if (!updatedSkill) throw new NotFoundException('Skill not found');
    return updatedSkill;
  }

  async deleteSkill(skill_id: string) {
    const skill = await this.skill_repository.findOneBy({
      _id: new ObjectId(skill_id),
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skill_repository.remove(skill);
    return { message: 'Skill deleted successfully' };
  }
}
