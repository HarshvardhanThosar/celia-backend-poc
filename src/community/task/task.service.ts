import { Injectable } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  create(createTaskDTO: CreateTaskDTO) {
    return 'This action adds a new task';
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDTO: UpdateTaskDTO) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
