import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private task_repository: Repository<Task>,

    @InjectRepository(TaskType)
    private task_type_repository: Repository<TaskType>,

    private profile_service: ProfileService,
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
    const [tasks, total_count] = await this.task_repository.findAndCount({
      // where: { status: TaskStatus.ACTIVE },
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

      if (isNaN(starts_at.getTime()) || isNaN(completes_at.getTime())) {
        throw new BadRequestException('Invalid start or completion date');
      }
      const daily_attendance_codes = this.generate_attendance_codes(
        starts_at,
        completes_at,
      );

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

      const score_response = await axios.post(
        'http://python-task-score:8000/api/v1/task/calculate-score',
        { task_id: new_task._id.toString() },
      );

      if (score_response.data) {
        await this.task_repository.update(new_task._id, {
          score_breakdown: score_response.data.breakdown,
          score_assignment_status: ScoreAssignmentStatus.ASSIGNED,
        });
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
        'http://python-task-score:8000/api/v1/task/calculate-score',
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

    task.updated_at = new Date();
    await this.task_repository.save(task);
    return task;
  }

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

    return { message: 'Participation accepted successfully' };
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

    if (!accepted)
      throw new ForbiddenException('You are not an accepted participant');

    const logged = task.attendance_log?.[today] || [];
    if (logged.includes(user_id)) {
      return { message: 'Already marked attendance for today' };
    }

    if (!task.attendance_log) task.attendance_log = {};
    task.attendance_log[today] = [...logged, user_id];

    await this.task_repository.save(task);

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
