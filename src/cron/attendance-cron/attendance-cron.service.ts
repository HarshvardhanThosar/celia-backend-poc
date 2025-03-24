// In AttendanceService

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Task } from 'src/community/tasks/entities/task.entity';
import { Profile } from 'src/community/profile/entities/profile.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskStatus } from 'src/community/tasks/enums/task-status.enum';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(Task)
    private readonly task_repository: MongoRepository<Task>,

    @InjectRepository(Profile)
    private readonly profile_repository: MongoRepository<Profile>,
  ) {}

  /**
   * CRON job to run daily at midnight to distribute rewards
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handle_task_completion_and_rewards() {
    const today = new Date();

    const tasks_due = await this.task_repository.find({
      where: {
        completes_at: { $lte: today },
        status: TaskStatus.ACTIVE,
      },
    });

    for (const task of tasks_due) {
      await this.distribute_rewards(task);
      task.status = TaskStatus.COMPLETED;
      await this.task_repository.save(task);
      this.logger.log(`✅ Rewards distributed for task: ${task._id}`);
    }
  }

  async distribute_rewards(task: Task) {
    const duration_days = this.calculate_days(
      task.starts_at,
      task.completes_at,
    );
    const skill_ids = task.task_type.skills.map((s) => s._id.toString());
    const skill_map = new Map(
      task.task_type.skills.map((s) => [s._id.toString(), s.name]),
    );

    for (const participant of task.participants || []) {
      if (participant.status !== 'accepted') continue;

      const attendance_dates = Object.entries(task.attendance_log || {})
        .filter(([_, user_ids]) => user_ids.includes(participant.user_id))
        .map(([date]) => date);

      const attendance_days = new Set(
        attendance_dates.map((d) => new Date(d).toDateString()),
      );
      const total_days_attended = attendance_days.size;

      if (total_days_attended === 0) continue;

      const profile = await this.profile_repository.findOne({
        where: { _id: participant.user_id },
      });

      if (!profile) continue;

      const skill_map_profile = new Map(
        (profile.skills || []).map((s) => [s.skill_id, s]),
      );

      for (const skill_id of skill_ids) {
        const hours = total_days_attended * task.hours_required_per_day;
        const existing = skill_map_profile.get(skill_id);

        if (existing) {
          existing.hours += hours;
        } else {
          skill_map_profile.set(skill_id, {
            skill_id,
            skill_name: skill_map.get(skill_id) || '',
            hours,
          });
        }
      }

      profile.skills = Array.from(skill_map_profile.values());
      await this.profile_repository.save(profile);
      this.logger.log(
        `🎯 Updated skills for participant ${participant.user_id} in task ${task._id}`,
      );
    }
  }

  private calculate_days(start: Date, end: Date): number {
    const diff = Math.floor(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return diff + 1;
  }
}
