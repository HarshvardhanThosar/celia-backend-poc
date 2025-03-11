import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  is_remote?: boolean = true;

  @ValidateNested()
  @IsOptional()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsNumber()
  @Min(1)
  volunteers_required: number;

  @IsNumber()
  @Min(1)
  @Max(6) // Based on your FastAPI reference
  hours_required_per_day: number;

  @IsDate()
  @Type(() => Date)
  starts_at: Date;

  @IsDate()
  @Type(() => Date)
  completes_at: Date;

  @IsString()
  @IsNotEmpty()
  task_type: string; // Task type ID

  @IsNumber()
  @IsOptional()
  min_score?: number;

  @IsNumber()
  @IsOptional()
  max_score?: number;

  @IsOptional()
  participants?: any[];
}
