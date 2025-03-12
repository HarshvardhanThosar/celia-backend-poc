import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class NotificationBodyDTO {
  @ApiProperty({
    description: 'Main message of the notification',
    example: 'You have a new task invitation!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'URL associated with the notification',
    example: 'https://example.com/task/12345',
  })
  @IsString()
  @IsNotEmpty()
  url: string; // Using string instead of URL object for compatibility

  @ApiProperty({
    description: 'Shortened version of the notification message',
    example: 'New task available!',
  })
  @IsString()
  @IsNotEmpty()
  short_message: string;

  @ApiProperty({
    description: 'Optional icon URL for the notification',
    example: 'https://example.com/icon.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
