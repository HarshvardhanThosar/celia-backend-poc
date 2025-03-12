import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { TaskTypeStatus } from '../enums/task-type-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskTypeDTO {
  @ApiProperty({
    description: 'Name of the task type',
    example: 'Community Service',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Optional description of the task type',
    example: 'Volunteering for community welfare',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of skill IDs required for this task type',
    example: ['65f8a2cd3b8e7c001c2c4e92', '65f8a2cd3b8e7c001c2c4e93'],
  })
  @IsArray()
  @IsString({ each: true }) // Expecting an array of Skill IDs
  skills: string[];

  @ApiProperty({
    description: 'Status of the task type',
    example: TaskTypeStatus.ACTIVE,
    required: false,
    enum: TaskTypeStatus,
  })
  @IsOptional()
  @IsEnum(TaskTypeStatus)
  status?: TaskTypeStatus;
}
