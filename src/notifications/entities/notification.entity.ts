import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('notifications')
export class Notification {
  @ObjectIdColumn()
  _id: string;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
