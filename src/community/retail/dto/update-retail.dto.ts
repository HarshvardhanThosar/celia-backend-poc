import { PartialType } from '@nestjs/swagger';
import { CreateRetailDTO } from './create-retail.dto';

export class UpdateRetailDTO extends PartialType(CreateRetailDTO) {}
