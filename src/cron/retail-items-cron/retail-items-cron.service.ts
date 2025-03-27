import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { randomInt } from 'crypto';
import { ObjectId } from 'mongodb';
import { RetailItem } from 'src/community/retail/entities/retail-item.entity';
import { RetailBatch } from 'src/community/retail/entities/retail-batch.entity';

@Injectable()
export class RetailItemsCronService {
  constructor(
    @InjectRepository(RetailItem)
    private readonly retailItemRepository: Repository<RetailItem>,

    @InjectRepository(RetailBatch)
    private readonly retailBatchRepository: Repository<RetailBatch>,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async importCsvRetailItems() {
    const filePath = path.join(
      process.cwd(),
      'src',
      'assets',
      'retail-items-data.csv',
    );
    if (!fs.existsSync(filePath)) {
      console.warn('CSV file not found:', filePath);
      return;
    }

    const dataRows = await this.readCsv(filePath);
    if (dataRows.length === 0) return;

    const retailer_id = 'ALDI028734';
    const now = new Date();

    const batch = this.retailBatchRepository.create({
      retailer_id,
      status: 'active',
      created_at: now,
      updated_at: now,
    });
    const savedBatch = await this.retailBatchRepository.save(batch);

    const retailItems: Partial<RetailItem>[] = dataRows.map((row) => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + randomInt(1, 2));
      const manufactured = new Date(expiry);
      manufactured.setDate(expiry.getDate() - 14);

      return {
        name: row.name,
        status: 'active',
        price: parseFloat(row.price),
        currency: row.currency || 'EUR',
        category: row.category,
        sku_id: row.sku_id,
        quantity: randomInt(1, 11),
        weight: parseInt(row.weight || '1'),
        manufactured_date: manufactured,
        expiry_date: expiry,
        retailer_id,
        retail_batch_id: savedBatch._id.toString(),
        thumbnail: row.thumbnail || '',
        created_at: now,
        updated_at: now,
      };
    });

    await this.retailItemRepository.insert(retailItems);
    console.log(
      `[Cron] Retail items uploaded from CSV. Count: ${retailItems.length}`,
    );
  }

  private async readCsv(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}
