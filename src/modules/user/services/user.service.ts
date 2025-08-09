import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { USER } from '@constants/responseMessages.const';

import { updateDto } from '../dto/update.dto';
import { User } from '../entities/user.entity';
import { UserType } from '../types/user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email: email });
  }

  async findOneById(userId: string) {
    return this.userRepository.findOneBy({ user_id: userId });
  }

  async create(user: UserType) {
    const createdUser = await this.userRepository.save(user);
    if (!createdUser) {
      throw new BadRequestException(USER.CREATE_ERROR);
    }
    return createdUser;
  }

  async updateOne(user_id: string, updateBody: updateDto) {
    const result = await this.userRepository.update({ user_id }, updateBody);
    if (!result.affected) {
      throw new BadRequestException(USER.UPDATE_ERROR);
    }
    return this.userRepository.findOneBy({ user_id });
  }

  async delete(userId: string) {
    const result = await this.userRepository.delete({ user_id: userId });
    if (!result.affected) {
      throw new BadRequestException(USER.DELETE_ERROR);
    }
    return result;
  }
}
