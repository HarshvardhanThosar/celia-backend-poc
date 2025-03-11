import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TaskTypesService } from './task_types.service';
import { CreateTaskTypeDTO } from './dto/create-task_type.dto';
import { UpdateTaskTypeDTO } from './dto/update-task_type.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';

@Controller('task-types')
export class TaskTypesController {
  constructor(private readonly TaskTypesService: TaskTypesService) {}

  @Get()
  @ApiBearerAuth()
  async getAllTaskTypes() {
    return this.TaskTypesService.get_all_task_types();
  }

  @Get(':task_type_id')
  @ApiBearerAuth()
  async getTaskTypeById(@Param('task_type_id') task_type_id: string) {
    return this.TaskTypesService.get_task_type_by_id(task_type_id);
  }

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  async createTaskType(@Body() createTaskTypeDTO: CreateTaskTypeDTO) {
    return this.TaskTypesService.create_task_type(createTaskTypeDTO);
  }

  @Patch(':task_type_id')
  @Roles('admin')
  @ApiBearerAuth()
  async updateTaskType(
    @Param('task_type_id') task_type_id: string,
    @Body() updateTaskTypeDTO: UpdateTaskTypeDTO,
  ) {
    return this.TaskTypesService.update_task_type(
      task_type_id,
      updateTaskTypeDTO,
    );
  }

  @Delete(':task_type_id')
  @Roles('admin')
  @ApiBearerAuth()
  async deleteTaskType(@Param('task_type_id') task_type_id: string) {
    return this.TaskTypesService.delete_task_type(task_type_id);
  }
}
