import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthenticatedRequest } from '@guards/types/authenticatedRequest.types';

import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { ItemRequest } from './entities/itemRequest.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemRequest)
    private itemRequestRepository: Repository<ItemRequest>,
  ) {}

  async create(createItemDto: CreateItemDto, request: AuthenticatedRequest) {
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
    return this.itemRequestRepository.find();
  }

  async findOne(id: string) {
    return this.itemRequestRepository.findOne({ where: { item_id: id } });
  }

  async findAllByUser(userId: string) {
    return this.itemRequestRepository.find({
      where: { requester_user_id: userId },
    });
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    return this.itemRequestRepository.save({ item_id: id, ...updateItemDto });
  }

  async delete(id: string) {
    return this.itemRequestRepository.delete({ item_id: id });
  }
}
