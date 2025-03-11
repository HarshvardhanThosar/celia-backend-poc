import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { TaskTypesService } from './task_types.service';
import { CreateTaskTypeDTO } from './dto/create-task_type.dto';
import { UpdateTaskTypeDTO } from './dto/update-task_type.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { create_response } from 'src/common/utils/response.util';

@Controller('task-types')
export class TaskTypesController {
  constructor(private readonly TaskTypesService: TaskTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_all_task_types(@Res() response) {
    return create_response(response, {
      data: await this.TaskTypesService.get_all_task_types(),
      message: 'Task types fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get(':task_type_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_task_type_by_id(
    @Param('task_type_id') task_type_id: string,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.TaskTypesService.get_task_type_by_id(task_type_id),
      message: 'Task type fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  async create_task_type(
    @Body() createTaskTypeDTO: CreateTaskTypeDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.TaskTypesService.create_task_type(createTaskTypeDTO),
      message: 'Task type created successfully',
      status: HttpStatus.CREATED,
    });
  }

  @Patch(':task_type_id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async update_task_type(
    @Param('task_type_id') task_type_id: string,
    @Body() update_task_type_dto: UpdateTaskTypeDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.TaskTypesService.update_task_type(
        task_type_id,
        update_task_type_dto,
      ),
      message: 'Task type updated successfully',
      status: HttpStatus.OK,
    });
  }

  @Delete(':task_type_id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async delete_task_type(
    @Param('task_type_id') task_type_id: string,
    @Res() response,
  ) {
    return create_response(response, {
      data: await this.TaskTypesService.delete_task_type(task_type_id),
      message: 'Task type deleted successfully',
      status: HttpStatus.NO_CONTENT,
    });
  }
}
