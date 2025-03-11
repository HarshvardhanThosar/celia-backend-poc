import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class NotificationBody {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  url: string; // Using string instead of URL object for compatibility

  @IsString()
  @IsNotEmpty()
  short_message: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
