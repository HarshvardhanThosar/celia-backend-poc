import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export class CommunityRetailItem {
  _id: ObjectId;

  name: string;

  points: number;

  category: string;

  sku_id: string;

  weight: string | number;

  quantity: number;

  expiry_date: Date;

  thumbnail: string;

  retailer: {
    id: string;
    name: string;
    store: string;
    batch_id: string;
  };
}
