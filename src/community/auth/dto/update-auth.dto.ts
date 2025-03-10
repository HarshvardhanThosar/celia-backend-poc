import { PartialType } from '@nestjs/swagger';
import { RegisterAuthDTO } from './register-auth.dto';

export class UpdateAuthDTO extends PartialType(RegisterAuthDTO) {}
