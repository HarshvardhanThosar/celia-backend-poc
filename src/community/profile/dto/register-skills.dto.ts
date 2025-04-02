import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class RegisterSkillsDTO {
  @IsArray()
  @Type(() => String)
  skill_ids: string[];
}
