import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { ProfileModule } from '../profile/profile.module'; // Add this
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Skill, TaskType]),
    ProfileModule,
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
