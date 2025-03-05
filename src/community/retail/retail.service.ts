import { Injectable } from '@nestjs/common';
import { CreateRetailDto } from './dto/create-retail.dto';
import { UpdateRetailDto } from './dto/update-retail.dto';

@Injectable()
export class RetailService {
  create(createRetailDto: CreateRetailDto) {
    return 'This action adds a new retail';
  }

  findAll() {
    return `This action returns all retail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} retail`;
  }

  update(id: number, updateRetailDto: UpdateRetailDto) {
    return `This action updates a #${id} retail`;
  }

  remove(id: number) {
    return `This action removes a #${id} retail`;
  }
}
