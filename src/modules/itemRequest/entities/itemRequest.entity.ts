import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

@Entity()
export class ItemRequest {
  @PrimaryGeneratedColumn('uuid')
  item_id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'requester_user_id' })
  requester_user_id: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  status: 'refurbished' | 'new' | 'pre-owned';

  @Column()
  age_of_item: number;

  @Column()
  no_of_items: number;

  @Column()
  max_price: number;
}
