import { IsDate, IsNotEmpty } from 'class-validator';
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserVerify {
    @PrimaryGeneratedColumn('uuid')
    user_verify_id: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    @IsNotEmpty()
    unique_string: string;

    @Column()
    @IsDate()
    expiring_at: Date;
}
