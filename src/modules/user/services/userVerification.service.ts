import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserVerify } from '../../user/entities/userVerify.entity';
import { UserVerifyType } from '../types/userVerify.types';

@Injectable()
export class UserVerificationService {
  constructor(
    @InjectRepository(UserVerify)
    private userVerifyRepository: Repository<UserVerify>,
  ) {}

  async findOne(uniqueString: string) {
    return this.userVerifyRepository.findOne({
      where: {
        unique_string: uniqueString,
      },
      relations: ['user'],
    });
  }

  async create(userVerify: UserVerifyType) {
    return this.userVerifyRepository.save(userVerify);
  }

  async deleteOne(userVerifyId: string) {
    return this.userVerifyRepository.delete({
      user_verify_id: userVerifyId,
    });
  }
}
