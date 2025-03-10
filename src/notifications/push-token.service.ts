import { Injectable } from '@nestjs/common';
// import Expo from 'expo-server-sdk';
import { PushToken } from './entities/push-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserID } from 'src/keycloak/types/user';

@Injectable()
export class PushTokenService {
  //   private expo: Expo;

  //   constructor(
  //     @InjectRepository(PushToken)
  //     private readonly pushTokenRepository: Repository<PushToken>,
  //   ) {
  //     this.expo = new Expo();
  //   }

  //   async sendNotificationToUser(user_id: UserID, title: string, body: string) {
  //     const user_token = await this.pushTokenRepository.findOne({
  //       where: { user_id },
  //     });

  //     if (!user_token || !Expo.isExpoPushToken(user_token.push_token)) {
  //       throw new Error('Invalid or missing push token');
  //     }

  //     const message = {
  //       to: user_token.push_token,
  //       sound: 'default',
  //       title,
  //       body,
  //       data: { user_id },
  //     };

  //     try {
  //       const response = await this.expo.sendPushNotificationsAsync([message]);
  //       console.log('Push notification sent:', response);
  //       return response;
  //     } catch (error) {
  //       console.error('Error sending push notification:', error);
  //       throw new Error('Failed to send push notification');
  //     }
  //   }

  constructor(
    @InjectRepository(PushToken)
    private readonly pushTokenRepository: Repository<PushToken>,
  ) {}

  async register_push_token(user_id: UserID, push_token: string) {
    const existingToken = await this.pushTokenRepository.findOne({
      where: { user_id },
    });

    if (existingToken) {
      existingToken.push_token = push_token; // Update the token if it already exists
      await this.pushTokenRepository.save(existingToken);
    } else {
      const newPushToken = this.pushTokenRepository.create({
        user_id,
        push_token,
      });
      await this.pushTokenRepository.save(newPushToken);
    }

    return { message: 'Push token registered successfully!' };
  }

  async get_user_push_token(user_id: UserID) {
    return await this.pushTokenRepository.findOne({ where: { user_id } });
  }

  async delete_user_push_token(user_id: UserID) {
    return await this.pushTokenRepository.delete({ user_id });
  }
}
