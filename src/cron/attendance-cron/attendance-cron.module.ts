import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance-cron.service';
import { Task } from 'src/community/tasks/entities/task.entity';
import { Profile } from 'src/community/profile/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Profile])],
  providers: [AttendanceService],
})
export class AttendanceCronModule {}
