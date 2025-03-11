import { Module } from '@nestjs/common';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { MasterService } from './master.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsModule } from 'src/skills/skills.module';
import { TaskTypesModule } from 'src/task_types/task_types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, TaskType]),
    SkillsModule,
    TaskTypesModule,
  ],
  providers: [MasterService],
  exports: [MasterService],
})
export class MasterModule {}
