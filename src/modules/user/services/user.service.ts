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
    return this.userRepository.findOneBy({ email: email });
  }

  async create(user: UserType) {
    return this.userRepository.save(user);
  }

  async updateOne(
    updatedUser: Partial<
      UserType & { user_id: string; phoneNo: number; address: string }
    >,
  ) {
    return this.userRepository.save(updatedUser);
  }

  async delete(userId: string) {
    return this.userRepository.delete({ user_id: userId });
  }
}
