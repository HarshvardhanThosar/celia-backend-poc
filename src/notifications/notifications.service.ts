import { Injectable } from '@nestjs/common';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    this.expo = new Expo();
  }

  async create(_create_notification_dto: CreateNotificationDTO) {
    const { push_token, notification_type, title, body, replacable } =
      _create_notification_dto;

    // Validate Expo push token
    if (!Expo.isExpoPushToken(push_token)) {
      throw new Error('Invalid Expo push token');
    }

    // Create notification entity in DB
    const notification = this.notificationRepository.create({
      push_token,
      notification_type,
      title,
      body: JSON.stringify(body),
      replaceable: replacable || false,
    });

    await this.notificationRepository.save(notification);

    // Construct the push message
    const message: ExpoPushMessage = {
      to: push_token,
      sound: 'default',
      title,
      body: body.message,
      data: {
        url: body.url,
        short_message: body.short_message,
        icon: body.icon || null,
      },
    };

    try {
      const response = await this.expo.sendPushNotificationsAsync([message]);
      return { message: 'Notification sent successfully', response };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw new Error('Failed to send push notification');
    }
  }
}
