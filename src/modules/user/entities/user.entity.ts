import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: 'admin' | 'seller' | 'buyer';

  @Column({ type: 'bigint', nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column()
  is_verified: boolean;
}
