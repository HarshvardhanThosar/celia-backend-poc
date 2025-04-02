import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('retail_items')
export class RetailItem {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  status: string;

  @Column()
  name: string;

  @Column()
  currency: string;

  @Column('float')
  price: number;

  @Column()
  category: string;

  @Column()
  sku_id: string;

  @Column('int')
  quantity: number;

  @Column('int')
  weight: number;

  @Column('date')
  manufactured_date: Date;

  @Column('date')
  expiry_date: Date;

  @Column()
  retailer_id: string;

  @Column()
  retail_batch_id: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
