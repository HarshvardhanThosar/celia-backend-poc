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
import { NotificationBody } from '../types/NotificationBody';

export class CreateNotificationDTO {
  @IsString()
  @IsNotEmpty()
  push_token: string; // Device push token

  @IsEnum(NotificationType)
  notification_type: NotificationType; // Enum for predefined notification types

  @IsString()
  @IsNotEmpty()
  title: string; // Notification title

  @ValidateNested()
  @Type(() => NotificationBody)
  body: NotificationBody; // Notification message body

  @IsBoolean()
  @IsOptional()
  replacable?: boolean = false; // Determines if the notification can be replaced
}
