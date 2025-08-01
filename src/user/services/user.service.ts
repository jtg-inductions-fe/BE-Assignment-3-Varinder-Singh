import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserType } from '../types/user.types';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {}

    async findOne(email: string) {
        return await this.userRepository.findOneBy({ email: email });
    }

    async create(user: UserType) {
        return await this.userRepository.save(user);
    }

    async updateOne(updatedUser: Partial<UserType & { user_id: string }>) {
        return await this.userRepository.save(updatedUser);
    }
}
