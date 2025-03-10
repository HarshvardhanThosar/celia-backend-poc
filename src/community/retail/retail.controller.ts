import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RetailService } from './retail.service';
import { CreateRetailDTO } from './dto/create-retail.dto';
import { UpdateRetailDTO } from './dto/update-retail.dto';

@Controller('community/retail')
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Post()
  create(@Body() createRetailDTO: CreateRetailDTO) {
    return this.retailService.create(createRetailDTO);
  }

  @Get()
  findAll() {
    return this.retailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRetailDTO: UpdateRetailDTO) {
    return this.retailService.update(+id, updateRetailDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.retailService.remove(+id);
  }
}
