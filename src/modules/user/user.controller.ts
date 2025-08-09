import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';

import { USER } from '@constants/responseMessages.const';

import { updateDto } from './dto/update.dto';
import { UserService } from './services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:email')
  async findOne(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Patch('/:userId')
  async update(
    @Param('userId') userId: string,
    @Body()
    updateBody: updateDto,
  ) {
    const user = await this.userService.updateOne(userId, updateBody);
    if (user) {
      return { message: USER.UPDATED };
    } else {
      throw new BadRequestException(USER.UPDATE_ERROR);
    }
  }

  @Delete('/:userId')
  async delete(@Param('userId') userId: string) {
    return this.userService.delete(userId);
  }
}
