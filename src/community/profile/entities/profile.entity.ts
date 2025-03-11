import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @ObjectIdColumn()
  _id: string;

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
}
