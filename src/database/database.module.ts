import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushToken } from 'src/notifications/entities/push-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: `mongodb+srv://${configService.get('MONGO_USERNAME')}:${configService.get(
          'MONGO_PASSWORD',
        )}@${configService.get('MONGO_HOST')}/?retryWrites=true&w=majority&appName=${configService.get(
          'MONGO_CLUSTER',
        )}`,
        database: configService.get('MONGO_DATABASE'),
        entities: [PushToken],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
