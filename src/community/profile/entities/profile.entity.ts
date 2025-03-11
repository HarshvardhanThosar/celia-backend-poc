import { ObjectId } from 'mongodb';
import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ default: 0 })
  score: number;

  @Column()
  wallet_id: string;

  @Column({ type: 'simple-array', default: [] })
  coupons: string[];

  @Column({ type: 'simple-array', default: [] })
  tasks_participated: string[];

  @Column({ type: 'simple-array', default: [] })
  tasks_created: string[];

  @Column({ nullable: true })
  profile_image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
