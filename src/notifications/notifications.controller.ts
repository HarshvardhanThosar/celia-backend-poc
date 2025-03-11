import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  create(@Body() _create_notification_dto: CreateNotificationDTO) {
    return this.notificationsService.create(_create_notification_dto);
  }
}
