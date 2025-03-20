import { Module } from '@nestjs/common';
import { RetailService } from './retail.service';
import { RetailController } from './retail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetailBatch } from './entities/retail-batch.entity';
import { RetailItem } from './entities/retail-item.entity';
import { Retailer } from './entities/retailer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RetailItem, RetailBatch, Retailer])],
  controllers: [RetailController],
  providers: [RetailService],
  exports: [RetailService],
})
export class RetailModule {}
