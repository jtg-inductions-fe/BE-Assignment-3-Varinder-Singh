import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { UserService } from '../../user/services/user.service';
import { MailService } from '../../mail/mail.service';
import { UserVerificationService } from '../../user/services/userVerification.service';
import {
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
    mockJWTService,
    mockMailService,
    mockResponse,
    mockSigninDto,
    mockSignupDto,
    mockUser,
    mockUserService,
    mockUserVerificationService,
    mockUserVerify,
} from '../../mock/auth.mock';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: mockUserService },
                {
                    provide: UserVerificationService,
                    useValue: mockUserVerificationService,
                },
                { provide: MailService, useValue: mockMailService },
                { provide: JwtService, useValue: mockJWTService },
            ],
            controllers: [AuthController],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signup', () => {
        it('should throw ConflictException if user already exists', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);

            await expect(service.signup(mockSignupDto)).rejects.toThrow(
                ConflictException,
            );

            expect(mockUserService.findOne).toHaveBeenCalledWith(
                mockUser.email,
            );
        });

        it('should throw InternalServerErrorException if user is not created', async () => {
            mockUserService.findOne.mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockImplementation(
                () => 'hashed-password',
            );
            mockUserService.create.mockResolvedValue(null);

            await expect(service.signup(mockSignupDto)).rejects.toThrow(
                InternalServerErrorException,
            );

            expect(mockUserService.create).toHaveBeenCalledWith({
                ...mockSignupDto,
                password: 'hashed-password',
                is_verified: false,
            });
        });

        it('should throw InternalServerErrorException if user verification is not created', async () => {
            mockUserService.findOne.mockResolvedValue(null);
            mockUserService.create.mockResolvedValue(mockUser);
            mockUserVerificationService.create.mockResolvedValue(null);

            await expect(service.signup(mockSignupDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });

        it('should return verify email message if user is created successfully', async () => {
            mockUserService.findOne.mockResolvedValue(null);
            mockUserService.create.mockResolvedValue(mockUser);
            mockUserVerificationService.create.mockResolvedValue(
                mockUserVerify,
            );

            await expect(service.signup(mockSignupDto)).resolves.toEqual({
                message:
                    'User registered successfully. Please verify your email to activate your account.',
            });

            expect(mockMailService.sendMail).toHaveBeenCalled();
        });
    });

    // describe('signin', () => {
    //     it("should throw NotFoundException if user doesn't exist", async () => {
    //         mockUserService.findOne.mockResolvedValue(null);
    //         const res = jest.mock<Response>(Response)
    //         await expect(
    //             service.signin(mockSigninDto, mockResponse),
    //         ).rejects.toThrow(NotFoundException);

    //         expect(mockUserService.findOne).toHaveBeenCalledWith(
    //             mockSigninDto.email,
    //         );
    //     });

    //     it('should throw ForbiddenException if user is not verified', async () => {
    //         mockUserService.findOne.mockResolvedValue({
    //             ...mockUser,
    //             is_verified: false,
    //         });

    //         await expect(
    //             service.signin(mockSigninDto, mockRes),
    //         ).rejects.toThrow(ForbiddenException);

    //         expect(mockUserService.findOne).toHaveBeenCalledWith(
    //             mockSigninDto.email,
    //         );
    //     });

    //     it('should throw UnauthorizedException if password is not correct', async () => {
    //         mockUserService.findOne.mockResolvedValue({
    //             ...mockUser,
    //             is_verified: true,
    //         });

    //         mockSigninDto.password = 'other-strong-password';
    //         await expect(
    //             service.signin(mockSigninDto, mockRes),
    //         ).rejects.toThrow(ForbiddenException);

    //         expect(mockUserService.findOne).toHaveBeenCalledWith(
    //             mockSigninDto.email,
    //         );
    //     });

    //     it('should throw UnauthorizedException if password is not correct', async () => {
    //         mockUserService.findOne.mockResolvedValue({
    //             ...mockUser,
    //             is_verified: true,
    //         });
    //         mockJWTService.signAsync.mockResolvedValue('jwt_token');

    //         (service.signin(mockSigninDto, mockResponse),
    //             expect(mockUserService.findOne).toHaveBeenCalledWith(
    //                 mockSigninDto.email,
    //             ));

    //         expect(mockResponse.status).toHaveBeenCalledWith(200);
    //         expect(mockResponse.header).toHaveBeenCalledWith(
    //             'Authorization',
    //             expect.stringContaining('Bearer '),
    //         );
    //         expect(mockResponse.json).toHaveBeenCalledWith({
    //             message: 'User signed in successfully',
    //         });
    //     });
    // });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
