import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { create_response } from 'src/common/utils/response.util';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { KeycloakUser } from 'nest-keycloak-connect';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { multerOptions } from 'src/configs/multer.config';

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

  @Get('/:task_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_task_by_id(@Param('task_id') task_id: string, @Res() response) {
    const task = await this.tasks_service.get_task_by_id(task_id);
    return create_response(response, {
      data: task,
      message: 'Task retrieved successfully',
      status: HttpStatus.OK,
    });
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('media', 5, multerOptions))
  create_task(
    @Body() task_data: CreateTaskDTO,
    @UploadedFiles() media: Express.Multer.File[],
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.tasks_service.create_task(task_data, media, user.sub),
      message: 'Task created successfully',
      status: HttpStatus.CREATED,
    });
  }

  @Patch('/:task_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('media', 5, multerOptions))
  update_task(
    @Param('task_id') task_id: string,
    @Body() update_data: UpdateTaskDTO,
    @UploadedFiles() media: Express.Multer.File[],
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.tasks_service.update_task(
        task_id,
        update_data,
        media,
        user.sub,
      ),
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
