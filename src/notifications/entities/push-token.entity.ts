import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('push_tokens')
export class PushToken {
  @ObjectIdColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  push_token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
