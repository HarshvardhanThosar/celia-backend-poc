import { UserID } from 'src/keycloak/types/user';
import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('push_tokens')
export class PushToken {
  @ObjectIdColumn()
  id: string;

  @Column()
  user_id: UserID;

  @Column()
  push_token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
