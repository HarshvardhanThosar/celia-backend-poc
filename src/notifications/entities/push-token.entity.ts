import { ObjectId } from 'mongodb';
import { UserID } from 'src/keycloak/types/user';
import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('push_tokens')
export class PushToken {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  user_id: UserID;

  @Column()
  push_token: string;

  @CreateDateColumn()
  created_at: Date;
}
