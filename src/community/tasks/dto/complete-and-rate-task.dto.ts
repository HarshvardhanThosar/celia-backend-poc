import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CompleteAndRateTaskDTO {
  @ApiProperty({
    description:
      'Feedback note for the task (combines completion remarks and rating feedback)',
    required: false,
    example: 'Well organized, but needed more volunteers.',
  })
  @IsString()
  @IsOptional()
  feedback_note?: string;

  @ApiProperty({
    description: 'Rating given to the task (1-5)',
    example: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}
