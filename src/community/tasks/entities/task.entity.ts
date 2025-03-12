import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import {
  ParticipationStatus,
  ScoreAssignmentStatus,
  TaskStatus,
} from '../enums/task-status.enum';

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
  starts_at: Date;

  @Column()
  completes_at: Date;

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

  @Column({
    type: 'enum',
    enum: ScoreAssignmentStatus,
    default: ScoreAssignmentStatus.UNASSIGNED,
  })
  score_assignment_status: ScoreAssignmentStatus;

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

  @Column({ type: 'json', default: [] })
  media?: string[];

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  feedback_note?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
