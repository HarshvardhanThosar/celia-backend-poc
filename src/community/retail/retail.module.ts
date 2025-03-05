import { Module } from '@nestjs/common';
import { RetailService } from './retail.service';
import { RetailController } from './retail.controller';

@Module({
  controllers: [RetailController],
  providers: [RetailService],
})
export class RetailModule {}
