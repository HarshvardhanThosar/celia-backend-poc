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

  @Column({ type: 'bool', default: false })
  tnc_accepted: boolean;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  coins: number;

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

  @Column({
    type: 'json',
    default: [],
  })
  skills: {
    skill_id: string;
    skill_name: string;
    hours: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
