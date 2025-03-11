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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks_service: TasksService) {}

  @Get('/rating-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_rating_options() {
    return this.tasks_service.get_rating_options();
  }

  @Get('/volunteer-count-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_volunteer_options() {
    return this.tasks_service.get_volunteer_options();
  }

  @Get('/hours-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_hours_options() {
    return this.tasks_service.get_hours_options();
  }

  @Get('/task-types')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  fetch_task_types() {
    return this.tasks_service.fetch_task_types();
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  get_tasks() {
    return this.tasks_service.get_tasks();
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  create_task(@Body() task_data, @Req() req) {
    return this.tasks_service.create_task(task_data, req.user.sub);
  }

  @Patch('/:task_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  update_task(
    @Param('task_id') task_id: string,
    @Body() update_data,
    @Req() req,
  ) {
    return this.tasks_service.update_task(task_id, update_data, req.user.sub);
  }

  @Delete('/:task_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  delete_task(@Param('task_id') task_id: string, @Req() req) {
    return this.tasks_service.delete_task(task_id, req.user.sub);
  }
}
