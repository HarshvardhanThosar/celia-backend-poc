import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDTO } from './create-task.dto';

export class UpdateTaskDTO extends PartialType(CreateTaskDTO) {
  @ApiProperty({ description: 'Updated task description', required: false })
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

  @ApiProperty({ description: 'Updated task start date', required: false })
  starts_at?: Date;

  @ApiProperty({ description: 'Updated task completion date', required: false })
  completes_at?: Date;

  @ApiProperty({ description: 'Updated task type ID', required: false })
  task_type?: string;
}
