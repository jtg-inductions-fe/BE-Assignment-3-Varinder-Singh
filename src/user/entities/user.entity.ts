import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserVerify } from './userVerify.entity';

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

    @Column()
    is_verified: boolean;
}
