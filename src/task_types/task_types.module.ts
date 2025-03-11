import { Module } from '@nestjs/common';
import { TaskTypesService } from './task_types.service';
import { TaskTypesController } from './task_types.controller';
import { TaskType } from './entities/task_type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from 'src/skills/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskType, Skill])],
  controllers: [TaskTypesController],
  providers: [TaskTypesService],
})
export class TaskTypesModule {}
