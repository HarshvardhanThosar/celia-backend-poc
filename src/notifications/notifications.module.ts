import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { PushTokenService } from './push-token.service';
import { PushToken } from './entities/push-token.entity';
import { PushTokenController } from './push-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, PushToken])],
  controllers: [NotificationsController, PushTokenController],
  providers: [NotificationsService, PushTokenService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
