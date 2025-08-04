import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import { signupDto } from '@modules/auth/dto/signup.dto';

import { UserService } from './services/user.service';

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
    @Body() updateBody: Partial<signupDto>,
  ) {
    return this.userService.updateOne({ user_id: userId, ...updateBody });
  }

  @Delete('/:userId')
  async delete(@Param('userId') userId: string) {
    return this.userService.delete(userId);
  }
}
