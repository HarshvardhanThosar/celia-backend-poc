import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDTO } from './create-task.dto';
import { IsArray, IsOptional, IsEnum } from 'class-validator';
import { ScoreAssignmentStatus, TaskPriority } from '../enums/task-status.enum';

export class UpdateTaskDTO extends PartialType(CreateTaskDTO) {
  @ApiProperty({
    description: 'Updated task description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Updated number of volunteers required',
    required: false,
  })
  volunteers_required?: number;

  @ApiProperty({
    description: 'Updated hours required per day',
    required: false,
  })
  hours_required_per_day?: number;

  @ApiProperty({
    description: 'Updated task start date',
    required: false,
  })
  starts_at?: Date;

  @ApiProperty({
    description: 'Updated task completion date',
    required: false,
  })
  completes_at?: Date;

  @ApiProperty({
    description: 'Updated task type ID',
    required: false,
  })
  task_type?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Updated task media files (PNG/JPEG)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  media?: Express.Multer.File[];

  @ApiProperty({
    description: 'Updated score assignment status',
    enum: ScoreAssignmentStatus,
    required: false,
  })
  @IsEnum(ScoreAssignmentStatus)
  @IsOptional()
  score_assignment_status?: ScoreAssignmentStatus;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;
}
