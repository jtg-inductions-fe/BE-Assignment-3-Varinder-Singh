import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { signinDto } from './dto/signin.dto';
import { signupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/signup')
    signup(@Body() signupDto: signupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('/signin')
    signin(@Body() signinDto: signinDto, @Res() res: Response) {
        return this.authService.signin(signinDto, res);
    }

    @Get('/verify/:uniqueString')
    verifyUser(@Param('uniqueString') uniqueString: string) {
        return this.authService.verifyUser(uniqueString);
    }
}
