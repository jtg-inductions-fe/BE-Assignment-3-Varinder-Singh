import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { USER_VERIFY } from '@constants/responseMessages.const';

import { UserVerify } from '../../user/entities/userVerify.entity';
import { UserVerifyType } from '../types/userVerify.types';

@Injectable()
export class UserVerificationService {
  constructor(
    @InjectRepository(UserVerify)
    private userVerifyRepository: Repository<UserVerify>,
  ) {}

  async findOneByUniqueString(uniqueString: string) {
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
    const result = await this.userVerifyRepository.delete({
      user_verify_id: userVerifyId,
    });

    if (!result.affected) {
      throw new NotFoundException(USER_VERIFY.VERIFIED_ALREADY);
    }
    return result;
  }
}
