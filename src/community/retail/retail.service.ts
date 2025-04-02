import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MongoRepository,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { RetailItem } from './entities/retail-item.entity';
import { CommunityRetailItem } from './entities/community-retail-item';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class RetailService {
  private readonly logger = new Logger(RetailService.name);
  private readonly POINTS_MULTIPLIER = 2000;

  constructor(
    @InjectRepository(RetailItem)
    private retail_items_repository: Repository<RetailItem>,

    @InjectRepository(Profile)
    private profile_repository: MongoRepository<Profile>,
  ) {}

  async get_available_items(
    page: number,
    pageSize: number,
  ): Promise<CommunityRetailItem[]> {
    const skip = page * pageSize;
    const currentDate = new Date();

    const items = await this.retail_items_repository.find({
      where: {
        // quantity: MoreThan(0),
        // expiry_date: MoreThanOrEqual(currentDate),
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
        'weight',
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
        weight: _item.weight,
        retailer: {
          id: _item.retailer_id,
          name: 'ALDI',
          store: 'Athlone',
          batch_id: _item.retail_batch_id,
        },
      }),
    );
  }

  async get_item_by_id(id: string): Promise<CommunityRetailItem | null> {
    let itemId: ObjectId;
    try {
      itemId = new ObjectId(id);
    } catch {
      throw new BadRequestException('Invalid item ID');
    }

    const item = await this.retail_items_repository.findOneBy({ _id: itemId });
    if (!item) return null;

    return {
      _id: item._id,
      name: item.name,
      points: item.price * this.POINTS_MULTIPLIER,
      category: item.category,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
      sku_id: item.sku_id,
      weight: item.weight,
      retailer: {
        id: item.retailer_id,
        name: 'ALDI',
        store: 'Athlone',
        batch_id: item.retail_batch_id,
      },
    };
  }

  async purchase_item(item_id: string, quantity: number, user_id: string) {
    let itemId: ObjectId, userId: ObjectId;
    try {
      itemId = new ObjectId(item_id);
    } catch {
      throw new BadRequestException('Invalid ID format');
    }

    const item = await this.retail_items_repository.findOneBy({ _id: itemId });
    if (!item) throw new NotFoundException('Item not found');

    if (item.expiry_date < new Date()) {
      throw new BadRequestException('Item has expired and cannot be purchased');
    }

    if (item.quantity < quantity) {
      throw new BadRequestException(
        `Only ${item.quantity} items available in stock`,
      );
    }

    const profile = await this.profile_repository.findOneBy({ _id: user_id });

    if (!profile) throw new NotFoundException('User profile not found');

    const total_cost = item.price * this.POINTS_MULTIPLIER * quantity;
    if (profile.coins < total_cost) {
      throw new BadRequestException('Insufficient coins to redeem this item');
    }

    // Ensure coupons array exists
    if (!Array.isArray(profile.coupons)) {
      profile.coupons = [];
    }

    profile.coins -= total_cost;
    // for (let i = 0; i < quantity; i++) {
    profile.coupons.push(item_id);
    // }

    try {
      await this.profile_repository.updateOne(
        { _id: profile._id },
        {
          $set: {
            coins: profile.coins,
            coupons: profile.coupons,
            updated_at: new Date(),
          },
        },
      );
    } catch (err) {
      this.logger.error('Error saving profile:', err);
      throw new InternalServerErrorException('Could not complete purchase');
    }

    item.quantity -= quantity;
    item.updated_at = new Date();

    try {
      await this.retail_items_repository.save(item);
    } catch (err) {
      this.logger.error('Error saving item:', err);
      throw new InternalServerErrorException('Could not update item stock');
    }

    return {
      message: 'Purchase successful',
      data: {
        item_id,
        quantity_purchased: quantity,
        remaining_stock: item.quantity,
        coins_remaining: profile.coins,
      },
    };
  }
}
