import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { TaskTypeStatus } from '../enums/task-type-status.enum';

export class CreateTaskTypeDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true }) // Expecting an array of Skill IDs
  skills: string[];

  @IsOptional()
  @IsEnum(TaskTypeStatus)
  status?: TaskTypeStatus;
}
