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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { create_response } from 'src/common/utils/response.util';
import { KeycloakUser } from 'nest-keycloak-connect';
import { KeycloakAuthUser } from 'src/keycloak/types/user';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const imageUploadConfig = {
  storage: diskStorage({
    destination: './uploads/tasks',
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'), false);
    }
    cb(null, true);
  },
};
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
  @UseInterceptors(FilesInterceptor('media', 5, imageUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Task creation payload', type: CreateTaskDTO })
  async create_task(
    @Body() task_data: CreateTaskDTO,
    @UploadedFiles() media_files: Express.Multer.File[],
    @KeycloakUser() user: KeycloakAuthUser,
    @Res() response,
  ) {
    const file_urls = media_files?.map(
      (file) => `/uploads/tasks/${file.filename}`,
    );
    return create_response(response, {
      data: this.tasks_service.create_task(
        { ...task_data, media: file_urls },
        user.sub,
      ),
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
