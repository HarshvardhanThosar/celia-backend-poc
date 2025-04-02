import { Module } from '@nestjs/common';
import { RetailItemsCronService } from './retail-items-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetailItem } from 'src/community/retail/entities/retail-item.entity';
import { RetailBatch } from 'src/community/retail/entities/retail-batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RetailItem, RetailBatch])],
  providers: [RetailItemsCronService],
})
export class RetailItemsCronModule {}
