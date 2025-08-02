import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/test/entities/testUser.entity';
import { UserVerify } from '../auth/test/entities/testUserVerify.entity';
import { UserVerificationService } from './services/userVerification.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserVerify])],
    controllers: [UserController],
    providers: [UserService, UserVerificationService],
    exports: [UserService, UserVerificationService],
})
export class UserModule {}
