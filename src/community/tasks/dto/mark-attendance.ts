import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MarkAttendanceDTO {
  @ApiProperty()
  @IsString()
  task_id: string;

  @ApiProperty()
  @IsString()
  code: string;
}
