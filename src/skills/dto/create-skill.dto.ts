import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SkillStatus } from '../enums/skill-status.enum';

export class CreateSkillDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SkillStatus)
  status?: SkillStatus;

  @IsInt()
  @Min(0)
  score: number;
}
