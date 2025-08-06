import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthenticatedRequest } from '@guards/types/authenticatedRequest.types';
import { UserService } from '@modules/user/services/user.service';
import { verifyUser } from '@utils/verifyUser.utils';

import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { ItemRequest } from './entities/itemRequest.entity';

@Injectable()
export class ItemService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(ItemRequest)
    private itemRequestRepository: Repository<ItemRequest>,
  ) {}

  async validateUser(request: AuthenticatedRequest) {
    const verifiedUser = await verifyUser(
      request.user.userId,
      request.user.email,
      this.userService,
    );
    if (!verifiedUser) {
      throw new BadRequestException('Invalid or unauthorized user');
    }
  }

  async create(createItemDto: CreateItemDto, request: AuthenticatedRequest) {
    await this.validateUser(request);
    // Calculating difference in milliseconds
    const diff =
      createItemDto.end_time.getTime() - createItemDto.start_time.getTime();

    // 1000 milliseconds * 60 minutes * 60 hours division gives total hours difference
    const hours = diff / (1000 * 60 * 60);

    if (hours < 48 || !Number.isInteger(hours)) {
      throw new BadRequestException(
        'Minimum time difference between start end time must be 48 hours and time must be in increments of 1 hour.',
      );
    }

    const user = { requester_user_id: request.user.userId, ...createItemDto };
    return this.itemRequestRepository.save(user);
  }

  async findAll() {
    return this.itemRequestRepository.find({ relations: ['requester'] });
  }

  async findOne(id: string) {
    return this.itemRequestRepository.findOne({
      where: { item_id: id },
      relations: ['requester'],
    });
  }

  async findAllByUser(userId: string) {
    return this.itemRequestRepository.find({
      where: { requester: { user_id: userId } },
      relations: ['requester'],
    });
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    request: AuthenticatedRequest,
  ) {
    await this.validateUser(request);
    return this.itemRequestRepository.save({ item_id: id, ...updateItemDto });
  }

  async delete(id: string, request: AuthenticatedRequest) {
    await this.validateUser(request);
    return this.itemRequestRepository.delete({ item_id: id });
  }
}
