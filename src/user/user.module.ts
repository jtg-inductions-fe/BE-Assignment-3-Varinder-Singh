import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserVerify } from './entities/userVerify.entity';
import { UserVerificationService } from './services/userVerification.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserVerify])],
    controllers: [UserController],
    providers: [UserService, UserVerificationService],
    exports: [UserService, UserVerificationService],
})
export class UserModule {}
