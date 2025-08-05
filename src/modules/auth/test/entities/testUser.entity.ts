import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TestUser {
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

  @Column()
  is_verified: boolean;
}
