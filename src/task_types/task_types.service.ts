import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { TaskType } from './entities/task_type.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { CreateTaskTypeDTO } from './dto/create-task_type.dto';
import { UpdateTaskTypeDTO } from './dto/update-task_type.dto';

@Injectable()
export class TaskTypesService {
  constructor(
    @InjectRepository(TaskType)
    private task_type_repository: Repository<TaskType>,
    @InjectRepository(Skill)
    private skill_repository: Repository<Skill>,
  ) {}

  async get_all_task_types() {
    return await this.task_type_repository.find({ relations: ['skills'] });
  }

  async get_task_type_by_id(task_type_id: string) {
    const task_type = await this.task_type_repository.findOne({
      where: { _id: new ObjectId(task_type_id) },
      relations: ['skills'],
    });
    if (!task_type) throw new NotFoundException('Task Type not found');
    return task_type;
  }

  async create_task_type(create_task_type_dto: CreateTaskTypeDTO) {
    const skills = await this.skill_repository.find({
      where: { _id: In(create_task_type_dto.skills) },
    });
    const new_task_type = this.task_type_repository.create({
      ...create_task_type_dto,
      skills,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.task_type_repository.save(new_task_type);
  }

  async update_task_type(
    task_type_id: string,
    update_task_type_dto: UpdateTaskTypeDTO,
  ) {
    const task_type = await this.task_type_repository.findOneBy({
      _id: new ObjectId(task_type_id),
    });
    if (!task_type) throw new NotFoundException('Task Type not found');

    let updated_skills: Skill[] | undefined;
    if (update_task_type_dto.skills) {
      updated_skills = await this.skill_repository.find({
        where: { _id: In(update_task_type_dto.skills) },
      });
    }

    await this.task_type_repository.update(
      { _id: new ObjectId(task_type_id) },
      { ...update_task_type_dto, skills: updated_skills },
    );
    return await this.task_type_repository.findOneBy({
      _id: new ObjectId(task_type_id),
    });
  }

  async delete_task_type(task_type_id: string) {
    const task_type = await this.task_type_repository.findOneBy({
      _id: new ObjectId(task_type_id),
    });
    if (!task_type) throw new NotFoundException('Task Type not found');
    await this.task_type_repository.remove(task_type);
    return { message: 'Task Type deleted successfully' };
  }
}
