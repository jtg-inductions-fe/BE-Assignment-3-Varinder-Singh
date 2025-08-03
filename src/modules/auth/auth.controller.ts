import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { signinDto } from './dto/signin.dto';
import { signupDto } from './dto/signup.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signupDto: signupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('/signin')
  signin(@Body() signinDto: signinDto) {
    return this.authService.signin(signinDto);
  }

  @Get('/verify/:uniqueString')
  verifyUser(@Param('uniqueString') uniqueString: string) {
    return this.authService.verifyUser(uniqueString);
  }
}
