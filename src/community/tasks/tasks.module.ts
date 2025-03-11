import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskType } from 'src/task_types/entities/task_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Skill, TaskType])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
