import { PartialType } from '@nestjs/swagger';
import { CreateSkillDTO } from './create-skill.dto';

export class UpdateSkillDTO extends PartialType(CreateSkillDTO) {}
