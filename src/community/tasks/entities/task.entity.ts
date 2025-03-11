import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { ParticipationStatus, TaskStatus } from '../enums/task-status.enum';

@Entity({ name: 'tasks' })
export class Task {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  owner_id: string;

  @Column()
  description: string;

  @Column()
  volunteers_required: number;

  @Column()
  hours_required_per_day: number;

  @Column()
  starts_at: number;

  @Column()
  completes_at: number;

  @ManyToOne(() => TaskType)
  task_type: TaskType;

  @Column()
  is_remote: boolean;

  @Column({ nullable: true })
  location?: { latitude: number; longitude: number };

  @Column()
  min_score: number;

  @Column()
  max_score: number;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.ACTIVE })
  status: TaskStatus;

  @Column({
    type: 'json',
    default: [],
  })
  participants: {
    user_id: string;
    status: ParticipationStatus;
    requested_at: number;
    updated_at?: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
