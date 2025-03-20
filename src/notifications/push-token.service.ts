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
  //     private readonly push_token_repository: Repository<PushToken>,
  //   ) {
  //     this.expo = new Expo();
  //   }

  //   async sendNotificationToUser(user_id: UserID, title: string, body: string) {
  //     const user_token = await this.push_token_repository.findOne({
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
  //       return response;
  //     } catch (error) {
  //       throw new Error('Failed to send push notification');
  //     }
  //   }

  constructor(
    @InjectRepository(PushToken)
    private readonly push_token_repository: Repository<PushToken>,
  ) {}
  async register_push_token(user_id: UserID, push_token: string) {
    let _existing_token = await this.push_token_repository.findOne({
      where: { user_id },
    });

    if (_existing_token) {
      if (_existing_token.push_token === push_token) {
        return _existing_token;
      }
      _existing_token.push_token = push_token;
      return await this.push_token_repository.save(_existing_token);
    }

    const _new_push_token = this.push_token_repository.create({
      user_id,
      push_token,
    });

    return await this.push_token_repository.save(_new_push_token);
  }

  async get_user_push_token(user_id: UserID) {
    return await this.push_token_repository.findOne({ where: { user_id } });
  }

  async delete_user_push_token(user_id: UserID) {
    return await this.push_token_repository.delete({ user_id });
  }
}
