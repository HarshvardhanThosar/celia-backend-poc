import { Type } from 'class-transformer';
import { NotificationType } from '../types/NotificationTypes';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationBodyDTO } from './notification-body.dto';

export class CreateNotificationDTO {
  @ApiProperty({ description: 'Device push token', example: 'fcm_token_12345' })
  @IsString()
  @IsNotEmpty()
  push_token: string;

  @ApiProperty({
    description: 'Type of notification',
    example: NotificationType.COMMUNITY_TASK_AVAILABLE,
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'New Community Task Available',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification message body',
    type: () => NotificationBodyDTO,
  })
  @ValidateNested()
  @Type(() => NotificationBodyDTO)
  body: NotificationBodyDTO;

  @ApiProperty({
    description: 'If true, notification can be replaced',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  replacable?: boolean = false;
}
