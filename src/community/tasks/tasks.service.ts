import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { ObjectId } from 'mongodb';
import { TaskStatus, ParticipationStatus } from './enums/task-status.enum';
import { TaskType } from 'src/task_types/entities/task_type.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private task_repository: Repository<Task>,

    @InjectRepository(TaskType)
    private task_type_repository: Repository<TaskType>,
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
      name: `${i + 1} hours`,
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
      where: { status: TaskStatus.ACTIVE },
      order: { created_at: 'DESC' },
      skip,
      take: page_size,
    });

    return { tasks, count: tasks.length, total_count };
  }

  async create_task(task_data: Partial<Task>, user_id: string) {
    const new_task = this.task_repository.create({
      ...task_data,
      owner_id: user_id,
      status: TaskStatus.ACTIVE,
      min_score: 1,
      max_score: 1,
      participants: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.task_repository.save(new_task);
  }

  async update_task(
    task_id: string,
    update_data: Partial<Task>,
    user_id: string,
  ) {
    const task = await this.task_repository.findOneBy({
      _id: new ObjectId(task_id),
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.owner_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to update this task',
      );

    Object.assign(task, update_data, { updated_at: new Date() });
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
