import { Injectable } from '@nestjs/common';
// import Expo from 'expo-server-sdk';
import { PushToken } from './entities/push-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserID } from 'src/keycloak/types/user';
import { NotificationsService } from './notifications.service';

@Injectable()
export class PushTokenService {
  constructor(
    @InjectRepository(PushToken)
    private readonly push_token_repository: Repository<PushToken>,
    private readonly notifications_service: NotificationsService,
  ) {}
  async register_push_token(user_id: UserID, push_token: string) {
    let existing = await this.push_token_repository.findOne({
      where: { user_id },
    });

    let updated = false;

    if (existing) {
      if (existing.push_token === push_token) {
        return existing; // No need to send a notification again
      }
      existing.push_token = push_token;
      await this.push_token_repository.save(existing);
      updated = true;
    } else {
      const new_token = this.push_token_repository.create({
        user_id,
        push_token,
      });
      await this.push_token_repository.save(new_token);
      updated = true;
    }

    if (updated) {
      // Send notification saying device registered
      await this.notifications_service.create({
        push_token,
        notification_type: 'DEVICE_REGISTERED' as any, // or define enum
        title: 'Device Registered',
        body: {
          message:
            'Your device has been successfully registered for push notifications.',
          short_message: 'Device registered!',
          url: 'celia://profile',
        },
        replacable: true,
      });
    }

    return existing;
  }

  async get_user_push_token(user_id: UserID) {
    return await this.push_token_repository.findOne({ where: { user_id } });
  }

  async delete_user_push_token(user_id: UserID) {
    return await this.push_token_repository.delete({ user_id });
  }
}
