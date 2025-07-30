import { Controller, Post } from '@nestjs/common';
import { AuthService } from 'auth/services/auth.service';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/signup')
    signup() {
        return this.authService.signup();
    }
}
