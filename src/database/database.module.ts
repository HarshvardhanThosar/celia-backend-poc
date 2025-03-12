import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../community/profile/entities/profile.entity';
import { Task } from '../community/tasks/entities/task.entity';
import { PushToken } from '../notifications/entities/push-token.entity';
import { Skill } from '../skills/entities/skill.entity';
import { TaskType } from '../task_types/entities/task_type.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGO_URI'),
        database: configService.get<string>('MONGO_DATABASE'),
        entities: [PushToken, Profile, Skill, TaskType, Task],
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
