import { Module } from '@nestjs/common';
import { SkillController } from './skills.controller';
import { SkillService } from './skills.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill])],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillsModule {}
