import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RetailService } from './retail.service';
import { CreateRetailDto } from './dto/create-retail.dto';
import { UpdateRetailDto } from './dto/update-retail.dto';

@Controller('retail')
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Post()
  create(@Body() createRetailDto: CreateRetailDto) {
    return this.retailService.create(createRetailDto);
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
  update(@Param('id') id: string, @Body() updateRetailDto: UpdateRetailDto) {
    return this.retailService.update(+id, updateRetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.retailService.remove(+id);
  }
}
