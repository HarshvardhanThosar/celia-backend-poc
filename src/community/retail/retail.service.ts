import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { RetailItem } from './entities/retail-item.entity';
import { CommunityRetailItem } from './entities/community-retail-item';

@Injectable()
export class RetailService {
  private readonly POINTS_MULTIPLIER = 10;

  constructor(
    @InjectRepository(RetailItem)
    private retail_items_repository: Repository<RetailItem>,
  ) {}

  async get_available_items(
    page: number,
    pageSize: number,
  ): Promise<CommunityRetailItem[]> {
    const skip = page * pageSize;
    const currentDate = new Date();

    const items = await this.retail_items_repository.find({
      where: {
        expiry_date: MoreThan(currentDate),
        quantity: MoreThan(0),
      },
      order: { created_at: 'DESC' },
      skip,
      take: pageSize,
      select: [
        '_id',
        'name',
        'price',
        'category',
        'thumbnail',
        'quantity',
        'expiry_date',
        'sku_id',
        'retailer_id',
      ],
    });

    return items.map(
      (_item): CommunityRetailItem => ({
        _id: _item._id,
        name: _item.name,
        points: _item.price * this.POINTS_MULTIPLIER,
        category: _item.category,
        thumbnail: _item.thumbnail,
        quantity: _item.quantity,
        expiry_date: _item.expiry_date,
        sku_id: _item.sku_id,
        retailer: {
          id: _item.retailer_id,
          name: 'Lidl',
          store: 'Athlone',
          batch_id: _item.retail_batch_id,
        },
      }),
    );
  }

  async get_item_by_id(id: string): Promise<CommunityRetailItem | null> {
    const item = await this.retail_items_repository.findOneBy({
      _id: new ObjectId(id),
    });
    if (!item) return item;
    return {
      _id: item._id,
      name: item.name,
      points: item.price * this.POINTS_MULTIPLIER,
      category: item.category,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
      sku_id: item.sku_id,
      retailer: {
        id: item.retailer_id,
        name: 'Lidl',
        store: 'Athlone',
        batch_id: item.retail_batch_id,
      },
    };
  }

  async purchase_item(item_id: string, quantity: number) {
    const item = await this.retail_items_repository.findOneBy({
      _id: new ObjectId(item_id),
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.expiry_date < new Date()) {
      throw new BadRequestException('Item has expired and cannot be purchased');
    }

    if (item.quantity < quantity) {
      throw new BadRequestException(
        `Only ${item.quantity} items available in stock`,
      );
    }

    item.quantity -= quantity;
    item.updated_at = new Date();

    await this.retail_items_repository.save(item);

    return {
      message: 'Purchase successful',
      data: {
        item_id: item_id,
        quantity_purchased: quantity,
        remaining_stock: item.quantity,
      },
    };
  }
}
