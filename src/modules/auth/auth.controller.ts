import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { signinDto } from './dto/signin.dto';
import { signupDto } from './dto/signup.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signupBody: signupDto) {
    return this.authService.signup(signupBody);
  }

  @Post('/signin')
  signin(@Body() signinBody: signinDto) {
    return this.authService.signin(signinBody);
  }

  @Get('/verify/:uniqueString')
  verifyUser(@Param('uniqueString') uniqueString: string) {
    return this.authService.verifyUser(uniqueString);
  }
}
