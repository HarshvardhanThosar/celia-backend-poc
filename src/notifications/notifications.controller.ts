import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { create_response } from 'src/common/utils/response.util';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  create(
    @Body() _create_notification_dto: CreateNotificationDTO,
    @Res() response,
  ) {
    return create_response(response, {
      data: this.notificationsService.create(_create_notification_dto),
      message: 'Notification created successfully',
      status: HttpStatus.OK,
    });
  }
}
