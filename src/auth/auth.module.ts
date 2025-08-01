import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'user/user.module';
import { MailModule } from 'mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [UserModule, MailModule, JwtModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
