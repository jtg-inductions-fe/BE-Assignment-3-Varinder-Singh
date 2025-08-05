import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import { UserService } from './services/user.service';
import { UserType } from './types/user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:email')
  async findOne(@Param('email') email: string) {
    return this.userService.findOne(email);
  }

  @Patch('/:userId')
  async update(
    @Param('userId') userId: string,
    @Body()
    updateBody: Partial<
      UserType & { user_id: string; phone: string; address: string }
    >,
  ) {
    return this.userService.updateOne({ user_id: userId, ...updateBody });
  }

  @Delete('/:userId')
  async delete(@Param('userId') userId: string) {
    return this.userService.delete(userId);
  }
}
