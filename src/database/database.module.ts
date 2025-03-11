import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/community/profile/entities/profile.entity';
import { PushToken } from 'src/notifications/entities/push-token.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskType } from 'src/task_types/entities/task_type.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        await {
          type: 'mongodb',
          url: `mongodb+srv://${configService.get('MONGO_USERNAME')}:${configService.get(
            'MONGO_PASSWORD',
          )}@${configService.get('MONGO_HOST')}/?retryWrites=true&w=majority&appName=${configService.get(
            'MONGO_CLUSTER',
          )}`,
          database: configService.get('MONGO_DATABASE'),
          entities: [PushToken, Profile, Skill, TaskType],
          synchronize: false,
          autoLoadEntities: true,
        },
    }),
  ],
})
export class DatabaseModule {}
