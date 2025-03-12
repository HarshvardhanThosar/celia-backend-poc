import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SkillStatus } from '../enums/skill-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDTO {
  @ApiProperty({ description: 'Name of the skill', example: 'First Aid' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Optional description of the skill',
    example: 'Basic emergency medical training',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the skill',
    example: SkillStatus.ACTIVE,
    required: false,
    enum: SkillStatus,
  })
  @IsOptional()
  @IsEnum(SkillStatus)
  status?: SkillStatus;

  @ApiProperty({ description: 'Skill score value', example: 50 })
  @IsInt()
  @Min(0)
  score: number;
}
