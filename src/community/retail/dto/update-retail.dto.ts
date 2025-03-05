import { PartialType } from '@nestjs/swagger';
import { CreateRetailDto } from './create-retail.dto';

export class UpdateRetailDto extends PartialType(CreateRetailDto) {}
