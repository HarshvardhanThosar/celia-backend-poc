import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { SkillStatus } from '../enums/skill-status.enum';

@Entity({ name: 'skills' })
export class Skill {
  @ObjectIdColumn()
  _id: ObjectId;

  @Index('IDX_unique_skill_name', { unique: true })
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: SkillStatus, default: SkillStatus.ACTIVE })
  status: SkillStatus;

  @Column()
  score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
