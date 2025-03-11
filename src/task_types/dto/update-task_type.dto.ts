import { PartialType } from '@nestjs/swagger';
import { CreateTaskTypeDTO } from './create-task_type.dto';

export class UpdateTaskTypeDTO extends PartialType(CreateTaskTypeDTO) {}
