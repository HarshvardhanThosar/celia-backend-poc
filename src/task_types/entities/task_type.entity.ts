import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskTypeStatus } from '../enums/task-type-status.enum';

@Entity({ name: 'task_types' })
export class TaskType {
  @ObjectIdColumn()
  _id: ObjectId;

  @Index('IDX_unique_task_type_name', { unique: true })
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Skill, { cascade: true })
  @JoinTable()
  skills: Skill[];

  @Column({
    type: 'enum',
    enum: TaskTypeStatus,
    default: TaskTypeStatus.ACTIVE,
  })
  status: TaskTypeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
