import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { create_response } from 'src/common/utils/response.util';
import { KeycloakUser } from 'nest-keycloak-connect';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks_service: TasksService) {}

  @Get('/rating-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_rating_options(@Res() response) {
    return create_response(response, {
      data: this.tasks_service.get_rating_options(),
      message: 'Rating options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/volunteer-count-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_volunteer_options(@Res() response) {
    return create_response(response, {
      data: this.tasks_service.get_volunteer_options(),
      message: 'Volunteer count options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/hours-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_hours_options(@Res() response) {
    return create_response(response, {
      data: this.tasks_service.get_hours_options(),
      message: 'Hours options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/task-types')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  fetch_task_types(@Res() response) {
    return create_response(response, {
      data: this.tasks_service.fetch_task_types(),
      message: 'Task types fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_tasks(@Res() response) {
    return create_response(response, {
      data: this.tasks_service.get_tasks(),
      message: 'Tasks fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  create_task(
    @Body() task_data: CreateTaskDTO,
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.tasks_service.create_task(task_data, user.sub),
      message: 'Task created successfully',
      status: HttpStatus.CREATED,
    });
  }

  @Patch('/:task_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  update_task(
    @Param('task_id') task_id: string,
    @Body() update_data: UpdateTaskDTO,
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.tasks_service.update_task(task_id, update_data, user.sub),
      message: 'Task updated successfully',
      status: HttpStatus.OK,
    });
  }

  @Delete('/:task_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  delete_task(
    @Param('task_id') task_id: string,
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.tasks_service.delete_task(task_id, user.sub),
      message: 'Task deleted successfully',
      status: HttpStatus.NO_CONTENT,
    });
  }
}
