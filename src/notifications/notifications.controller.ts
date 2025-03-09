import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() _create_notification_dto: CreateNotificationDto) {
    return this.notificationsService.create(_create_notification_dto);
  }
}
