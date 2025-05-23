import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  Min,
  Max,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDTO } from './location.dto';
import { ScoreAssignmentStatus, TaskPriority } from '../enums/task-status.enum';

export class CreateTaskDTO {
  @ApiProperty({
    description: 'Task description',
    example: 'Help clean the park',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Indicates if the task is remote',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_remote?: boolean;

  @ApiProperty({
    description: 'Task location (required if not remote)',
    type: () => LocationDTO,
    required: false,
  })
  @IsOptional()
  location?: LocationDTO;

  @ApiProperty({ description: 'Number of volunteers required', example: 5 })
  @IsNumber()
  @Min(1)
  volunteers_required: number;

  @ApiProperty({ description: 'Hours required per day', example: 3 })
  @IsNumber()
  @Min(1)
  @Max(6)
  hours_required_per_day: number;

  @ApiProperty({
    description: 'Task start date and time',
    example: '2025-03-15T09:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  starts_at: Date;

  @ApiProperty({
    description: 'Task completion date and time',
    example: '2025-03-16T18:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  completes_at: Date;

  @ApiProperty({
    description: 'Task type ID',
    example: '65f8a2cd3b8e7c001c2c4e92',
  })
  @IsString()
  @IsNotEmpty()
  task_type: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Task media files (PNG/JPEG)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  media?: Express.Multer.File[];

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;
}
