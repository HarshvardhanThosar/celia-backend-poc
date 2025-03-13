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
  Logger,
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
import { CompleteAndRateTaskDTO } from './dto/complete-and-rate-task.dto';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasks_service: TasksService) {}

  @Get('/rating-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_rating_options(@Res() response) {
    return create_response(response, {
      data: await this.tasks_service.get_rating_options(),
      message: 'Rating options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/volunteer-count-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_volunteer_options(@Res() response) {
    return create_response(response, {
      data: await this.tasks_service.get_volunteer_options(),
      message: 'Volunteer count options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/hours-options')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_hours_options(@Res() response) {
    return create_response(response, {
      data: await this.tasks_service.get_hours_options(),
      message: 'Hours options fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/task-types')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async fetch_task_types(@Res() response) {
    return create_response(response, {
      data: await this.tasks_service.fetch_task_types(),
      message: 'Task types fetched successfully',
      status: HttpStatus.OK,
    });
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_tasks(@Res() response) {
    return create_response(response, {
      data: await this.tasks_service.get_tasks(),
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
  async create_task(
    @Body() task_data: CreateTaskDTO,
    @UploadedFiles() media: Express.Multer.File[],
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    try {
      const created_task = await this.tasks_service.create_task(
        task_data,
        media,
        user.sub,
      );
      return create_response(response, {
        data: created_task,
        message: 'Task created and scored successfully',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      this.logger.error('Task creation failed:', error);
      return create_response(response, {
        message: error.message || 'Failed to create task',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @Patch('/:task_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('media', 5, multerOptions))
  async update_task(
    @Param('task_id') task_id: string,
    @Body() update_data: UpdateTaskDTO,
    @UploadedFiles() media: Express.Multer.File[],
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    try {
      const updated_task = await this.tasks_service.update_task(
        task_id,
        update_data,
        media,
        user.sub,
      );
      return create_response(response, {
        data: updated_task,
        message: 'Task updated and re-scored successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this.logger.error('Task update failed:', error);
      return create_response(response, {
        message: error.message || 'Failed to update task',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @Patch('/:task_id/complete-and-rate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async complete_and_rate_task(
    @Param('task_id') task_id: string,
    @Body() complete_and_rate_data: CompleteAndRateTaskDTO,
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    try {
      const updated_task = await this.tasks_service.complete_and_rate_task(
        task_id,
        complete_and_rate_data,
        user.sub,
      );
      return create_response(response, {
        data: updated_task,
        message: 'Task marked as completed and rated successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this.logger.error('Task completion and rating failed:', error);
      return create_response(response, {
        message: error.message || 'Failed to complete and rate the task',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
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
