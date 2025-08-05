import { IsDate, IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TestUser } from './testUser.entity';

@Entity()
export class TestUserVerify {
  @PrimaryGeneratedColumn('uuid')
  user_verify_id: string;

  @OneToOne(() => TestUser)
  @JoinColumn({ name: 'user_id' })
  user: TestUser;

  @Column()
  @IsNotEmpty()
  unique_string: string;

  @Column()
  @IsDate()
  expiring_at: Date;
}
