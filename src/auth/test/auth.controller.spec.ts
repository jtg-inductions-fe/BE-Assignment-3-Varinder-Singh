import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { MailService } from '../../mail/mail.service';
import { UserVerificationService } from '../../user/services/userVerification.service';
import { UserVerify } from '../../user/entities/userVerify.entity';

describe('AuthController', () => {
    let controller: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;

    const mockUserRepository = {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                UserService,
                UserVerificationService,
                MailService,
                JwtService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(UserVerify),
                    useValue: mockUserRepository,
                },
            ],
            exports: [AuthService],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        mockAuthService = module.get(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
