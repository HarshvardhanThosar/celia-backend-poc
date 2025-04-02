import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Task } from './entities/task.entity';
import { ObjectId } from 'mongodb';
import {
  TaskStatus,
  ParticipationStatus,
  ScoreAssignmentStatus,
} from './enums/task-status.enum';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import axios from 'axios';
import { CompleteAndRateTaskDTO } from './dto/complete-and-rate-task.dto';
import { ProfileService } from '../profile/profile.service';
import { PushTokenService } from 'src/notifications/push-token.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/types/NotificationTypes';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private task_repository: Repository<Task>,

    @InjectRepository(TaskType)
    private task_type_repository: Repository<TaskType>,

    private profile_service: ProfileService,
    private push_token_service: PushTokenService,
    private notifications_service: NotificationsService,
  ) {}

  async get_rating_options() {
    return Array.from({ length: 5 }, (_, i) => ({
      name: `${i + 1}`,
      value: i + 1,
    }));
  }

  async get_volunteer_options() {
    return Array.from({ length: 8 }, (_, i) => ({
      name: `${i + 1}`,
      value: i + 1,
    }));
  }

  async get_hours_options() {
    return Array.from({ length: 6 }, (_, i) => ({
      name: i + 1 == 1 ? `${i + 1} hour` : `${i + 1} hours`,
      value: i + 1,
    }));
  }

  async fetch_task_types() {
    const task_types = await this.task_type_repository.find();
    return task_types.map((task) => ({
      name: task.name,
      value: task._id.toString(),
    }));
  }

  async get_tasks(page_number = 0, page_size = 10) {
    const skip = page_number * page_size;
    const currentDate = new Date();
    const [tasks, total_count] = await this.task_repository.findAndCount({
      where: {
        status: TaskStatus.ACTIVE,
        // completes_at: MoreThanOrEqual(currentDate),
      },
      order: { created_at: 'DESC' },
      skip,
      take: page_size,
    });

    const user_ids = new Set<string>();
    for (const task of tasks) {
      user_ids.add(task.owner_id);
      (task.participants || []).forEach((p) => user_ids.add(p.user_id));
    }

    const enriched = await this.profile_service.enrich_users([...user_ids]);

    const enriched_tasks = tasks.map((task) => ({
      ...task,
      owner_details: enriched[task.owner_id],
      participants: (task.participants || []).map((p) => ({
        ...p,
        ...enriched[p.user_id],
      })),
    }));

    return {
      tasks: enriched_tasks,
      count: enriched_tasks.length,
      total_count,
    };
  }

  async get_task_by_id(task_id: string) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const user_ids = [
      task.owner_id,
      ...(task.participants || []).map((p) => p.user_id),
    ];

    const enriched = await this.profile_service.enrich_users(user_ids);

    return {
      ...task,
      owner_details: enriched[task.owner_id],
      participants: (task.participants || []).map((p) => ({
        ...p,
        ...enriched[p.user_id],
      })),
    };
  }

  async create_task(
    task_data: CreateTaskDTO,
    media_files: Express.Multer.File[],
    user_id: string,
  ) {
    const task_type = await this.task_type_repository.findOneBy({
      _id: new ObjectId(task_data.task_type),
    });

    if (!task_type) throw new NotFoundException('Task type not found');

    const file_urls = media_files
      ? media_files.map((file) => `/uploads/${file.filename}`)
      : [];

    try {
      const starts_at = new Date(task_data.starts_at);
      const completes_at = new Date(task_data.completes_at);
      if (starts_at.getFullYear() < 2000) {
        throw new BadRequestException(
          'Timestamp seems to be in seconds. Expected milliseconds.',
        );
      }
      if (isNaN(starts_at.getTime()) || isNaN(completes_at.getTime())) {
        throw new BadRequestException('Invalid start or completion date');
      }

      const daily_attendance_codes = this.generate_attendance_codes(
        starts_at,
        completes_at,
      );

      console.log({
        daily_attendance_codes,
      });

      const new_task = this.task_repository.create({
        ...task_data,
        owner_id: user_id,
        status: TaskStatus.ACTIVE,
        participants: [],
        created_at: new Date(),
        updated_at: new Date(),
        starts_at,
        completes_at,
        task_type,
        media: file_urls,
        score_assignment_status: ScoreAssignmentStatus.UNASSIGNED,
        daily_attendance_codes,
        attendance_log: {},
      });

      await this.task_repository.save(new_task);

      const score_response = await axios.post<{
        task_id: string;
        score_breakdown: {
          label: string;
          key: string;
          score: number;
        }[];
      }>('http://fast-api:8000/api/v1/task/calculate-score', {
        task_id: new_task._id.toString(),
      });

      if (score_response.data) {
        await this.task_repository.update(new_task._id, {
          score_breakdown: score_response.data.score_breakdown,
          score_assignment_status: ScoreAssignmentStatus.ASSIGNED,
        });
      }
      await this.profile_service.add_task_creation(
        user_id,
        new_task._id.toString(),
      );

      const all_profiles = await this.profile_service.get_all_profiles();
      for (const profile of all_profiles) {
        if (profile._id.toString() === user_id) continue;
        const token_record = await this.push_token_service.get_user_push_token(
          profile._id.toString(),
        );
        if (token_record?.push_token) {
          await this.notifications_service.create({
            push_token: token_record.push_token,
            notification_type: NotificationType.COMMUNITY_TASK_AVAILABLE,
            title: 'New Task Available! 🎯',
            body: {
              message: `A new community task has just been posted. Check it out!`,
              short_message: 'New Task Alert!',
              url: `celia://community-tasks/${new_task._id}`,
            },
            replacable: false,
          });
        }
      }
      return new_task;
    } catch (error) {
      this.logger.error('Task creation failed:', error);
      throw new BadRequestException('Failed to create task');
    }
  }

  async update_task(
    task_id: string,
    update_data: Partial<UpdateTaskDTO>,
    media_files: Express.Multer.File[],
    user_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== user_id)
      throw new ForbiddenException('Unauthorized to update this task');

    let task_type = task.task_type;
    if (update_data.task_type) {
      const updated_task_type = await this.task_type_repository.findOneBy({
        _id: new ObjectId(update_data.task_type),
      });

      if (!updated_task_type)
        throw new NotFoundException('Task type not found');
      task_type = updated_task_type;
    }

    let updated_media = task.media || [];
    if (media_files.length > 0) {
      const file_urls = media_files.map((file) => `/uploads/${file.filename}`);
      updated_media = [...updated_media, ...file_urls];
    }

    try {
      const updated_data = {
        ...update_data,
        task_type,
        media: updated_media,
        updated_at: new Date(),
      };

      Object.assign(task, updated_data);
      await this.task_repository.save(task);

      const score_response = await axios.post(
        'http://fast-api:8000/api/v1/task/calculate-score',
        { task_id: task._id.toString() },
      );

      if (score_response.data) {
        await this.task_repository.update(task._id, {
          score_breakdown: score_response.data.breakdown,
          score_assignment_status: ScoreAssignmentStatus.ASSIGNED,
        });
      }

      return task;
    } catch (error) {
      this.logger.error('Task update failed:', error);
      throw new BadRequestException('Failed to update task');
    }
  }

  async complete_and_rate_task(
    task_id: string,
    complete_and_rate_data: CompleteAndRateTaskDTO,
    user_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== user_id)
      throw new ForbiddenException(
        'Only the task owner can mark this task as completed',
      );

    if (task.status === TaskStatus.COMPLETED)
      throw new BadRequestException(
        'Task has already been marked as completed',
      );

    if (complete_and_rate_data.rating < 1 || complete_and_rate_data.rating > 5)
      throw new BadRequestException('Rating must be between 1 and 5');

    task.feedback_note = complete_and_rate_data.feedback_note || undefined;
    task.rating = complete_and_rate_data.rating;
    task.status = TaskStatus.COMPLETED;
    task.updated_at = new Date();
    await this.task_repository.save(task);

    if (task.status !== TaskStatus.COMPLETED) {
      task.status = TaskStatus.COMPLETED;
      task.updated_at = new Date();
      await this.task_repository.save(task);

      const accepted_participants = task.participants.filter(
        (p) => p.status === ParticipationStatus.ACCEPTED,
      );

      const duration_days = Math.ceil(
        (new Date(task.completes_at).getTime() -
          new Date(task.starts_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      for (const participant of accepted_participants) {
        const days_attended = Object.values(task.attendance_log || {}).filter(
          (day) => day.includes(participant.user_id),
        ).length;

        if (days_attended > 0) {
          await this.profile_service.update_skill_hours_from_attendance(
            participant.user_id,
            task._id.toString(),
            days_attended,
          );
        }
      }
    }
    return task;
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async handle_task_completion_and_rewards() {
  //   const now = new Date();
  //   const tasks = await this.task_repository.find({
  //     where: {
  //       status: TaskStatus.ACTIVE,
  //       completes_at: LessThanOrEqual(now),
  //     },
  //   });

  //   for (const task of tasks) {
  //     const attendance_log = task.attendance_log || {};
  //     const total_attendance = Object.values(attendance_log).reduce(
  //       (acc, users) => acc + users.length,
  //       0,
  //     );

  //     if (total_attendance === 0) {
  //       task.status = TaskStatus.UNATTENDED;
  //       task.updated_at = now;
  //       await this.task_repository.save(task);
  //       continue;
  //     }

  //     task.status = TaskStatus.COMPLETED;
  //     task.updated_at = now;
  //     await this.task_repository.save(task);

  //     const accepted_participants = task.participants.filter(
  //       (p) => p.status === ParticipationStatus.ACCEPTED,
  //     );

  //     for (const participant of accepted_participants) {
  //       const days_attended = Object.values(attendance_log).filter((users) =>
  //         users.includes(participant.user_id),
  //       ).length;

  //       if (days_attended > 0) {
  //         await this.profile_service.update_skill_hours_from_attendance(
  //           participant.user_id,
  //           task._id.toString(),
  //           days_attended,
  //         );
  //       }
  //     }
  //   }
  // }

  async delete_task(task_id: string, user_id: string) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to delete this task',
      );

    task.status = TaskStatus.INVALID;
    await this.task_repository.save(task);

    return { message: 'Task deleted successfully' };
  }

  async request_participation(task_id: string, user_id: string) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id === user_id)
      throw new ForbiddenException('Task owners cannot participate');

    if (task.participants.some((p) => p.user_id === user_id)) {
      throw new BadRequestException('You have already requested participation');
    }

    task.participants.push({
      user_id,
      status: ParticipationStatus.REQUESTED,
      requested_at: Date.now(),
      updated_at: Date.now(),
    });
    await this.task_repository.save(task);

    const token_record = await this.push_token_service.get_user_push_token(
      task.owner_id.toString(),
    );
    if (token_record?.push_token) {
      await this.notifications_service.create({
        push_token: token_record.push_token,
        notification_type:
          NotificationType.COMMUNITY_TASK_PARTICIPATION_REQUESTED,
        title: 'New participation request',
        body: {
          message: 'Someone requested to join your task!',
          short_message: 'New request received!',
          url: `celia://community-tasks/${task_id}`,
        },
        replacable: false,
      });
    }

    return { message: 'Participation request sent successfully' };
  }

  async accept_participation(
    task_id: string,
    participant_id: string,
    owner_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== owner_id)
      throw new ForbiddenException(
        'Only the task owner can accept participants',
      );

    const participant = task.participants.find(
      (p) => p.user_id === participant_id,
    );

    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.status === ParticipationStatus.ACCEPTED) {
      throw new BadRequestException('Participant already accepted');
    }

    participant.status = ParticipationStatus.ACCEPTED;
    participant.updated_at = Date.now();
    await this.task_repository.save(task);
    await this.profile_service.add_task_participation(
      participant_id,
      task._id.toString(),
    );
    const token_record = await this.push_token_service.get_user_push_token(
      participant_id.toString(),
    );
    if (token_record?.push_token) {
      await this.notifications_service.create({
        push_token: token_record.push_token,
        notification_type:
          NotificationType.COMMUNITY_TASK_PARTICIPATION_ACCEPTED,
        title: 'You have been accepted!',
        body: {
          message: 'Your participation in a task has been accepted.',
          short_message: 'You’re in!',
          url: `celia://community-tasks/${task_id}`,
        },
        replacable: false,
      });
    }

    return { message: 'Participation accepted successfully' };
  }

  async reject_participation(
    task_id: string,
    participant_id: string,
    owner_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== owner_id)
      throw new ForbiddenException(
        'Only the task owner can reject participants',
      );

    const participant = task.participants.find(
      (p) => p.user_id === participant_id,
    );

    if (!participant) throw new NotFoundException('Participant not found');

    // If participant is accepted, change to rejected
    if (participant.status === ParticipationStatus.ACCEPTED) {
      participant.status = ParticipationStatus.REJECTED;
      participant.updated_at = Date.now();
    }

    // If they were only in REQUESTED state, we leave them as is
    await this.task_repository.save(task);

    // Notify participant
    const token_record = await this.push_token_service.get_user_push_token(
      participant_id.toString(),
    );
    if (token_record?.push_token) {
      await this.notifications_service.create({
        push_token: token_record.push_token,
        notification_type:
          NotificationType.COMMUNITY_TASK_PARTICIPATION_REJECTED,
        title: 'Your participation was rejected',
        body: {
          message: 'Your participation request for a task was rejected.',
          short_message: 'Request rejected',
          url: `celia://community-tasks/${task_id}`,
        },
        replacable: false,
      });
    }

    return { message: 'Participation rejected successfully' };
  }

  private generate_attendance_codes(
    start: Date,
    end: Date,
  ): Record<string, string> {
    const codes: Record<string, string> = {};
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0]; // yyyy-mm-dd
      codes[dateKey] = Math.floor(1000 + Math.random() * 9000).toString();
      current.setDate(current.getDate() + 1);
    }

    return codes;
  }

  async mark_attendance(task_id: string, user_id: string, code: string) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });
    if (!task) throw new NotFoundException('Task not found');

    const today = new Date().toISOString().split('T')[0];
    const expected_code = task.daily_attendance_codes?.[today];

    if (!expected_code)
      throw new BadRequestException('No attendance code set for today');
    if (expected_code !== code)
      throw new ForbiddenException('Incorrect attendance code');

    const accepted = task.participants.some(
      (p) => p.user_id === user_id && p.status === ParticipationStatus.ACCEPTED,
    );

    if (!accepted) {
      task.participants.push({
        user_id,
        status: ParticipationStatus.ACCEPTED,
        requested_at: Date.now(),
        updated_at: Date.now(),
      });

      await this.profile_service.add_task_participation(
        user_id,
        task._id.toString(),
      );
    }

    const logged = task.attendance_log?.[today] || [];
    if (logged.includes(user_id)) {
      return { message: 'Already marked attendance for today' };
    }

    if (!task.attendance_log) task.attendance_log = {};
    task.attendance_log[today] = [...logged, user_id];

    await this.task_repository.save(task);
    // const attended_days = Object.values(task.attendance_log || {}).filter(
    //   (users) => users.includes(user_id),
    // ).length;
    // await this.profile_service.update_skill_hours_from_attendance(
    //   user_id,
    //   task._id.toString(),
    //   attended_days,
    // );

    return { message: 'Attendance marked successfully', date: today };
  }

  async remove_participation(
    task_id: string,
    participant_id: string,
    user_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.owner_id !== user_id && participant_id !== user_id) {
      throw new ForbiddenException(
        'You can only remove your own participation or that of a task you own',
      );
    }

    task.participants = task.participants.filter(
      (p) => p.user_id !== participant_id,
    );
    await this.task_repository.save(task);

    return { message: 'Participation removed successfully' };
  }
}
