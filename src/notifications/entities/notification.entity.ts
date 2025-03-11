import { ObjectId } from 'mongodb';
import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  push_token: string;

  @Column()
  notification_type: string; // Type of notification (e.g., "chat", "order_update")

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: false })
  replaceable: boolean; // Whether this notification should replace the previous one of the same type

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
