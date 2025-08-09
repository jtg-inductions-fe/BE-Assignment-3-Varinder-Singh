import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { USER, USER_VERIFY } from '@constants/responseMessages.const';
import {
  mockJWTService,
  mockMailService,
  mockSigninDto,
  mockSignupDto,
  mockUser,
  mockUserService,
  mockUserVerificationService,
  mockUserVerify,
} from '@mock/auth.mock';
import { MailService } from '@modules/mail/mail.service';
import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthService (unit)', () => {
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserService.create.mockRejectedValue(new ConflictException());
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');

      await expect(service.signup(mockSignupDto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockUserService.create).toHaveBeenCalledWith({
        ...mockSignupDto,
        password: 'hashed-password',
        is_verified: false,
      });
    });

    it('should return verify email message if user is created successfully', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');
      mockUserService.create.mockResolvedValue(mockUser);
      mockMailService.sendMail.mockResolvedValue(true);
      mockUserVerificationService.create.mockResolvedValue(mockUserVerify);

      await expect(service.signup(mockSignupDto)).resolves.toStrictEqual({
        message: USER.REGISTERED,
      });

      expect(mockUserService.create).toHaveBeenCalledWith({
        ...mockSignupDto,
        password: 'hashed-password',
        is_verified: false,
      });
      expect(mockMailService.sendMail).toHaveBeenCalled();
      expect(mockUserVerificationService.create).toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it("should throw NotFoundException if user doesn't exist", async () => {
      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
    });

    it('should throw UnauthorizedException if password is not correct', async () => {
      mockUserService.findOneByEmail.mockResolvedValue({
        ...mockUser,
        is_verified: true,
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
    });

    it('should throw ForbiddenException if user is not verified', async () => {
      mockUserService.findOneByEmail.mockResolvedValue({
        ...mockUser,
        is_verified: false,
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
    });

    it('should sign in user successfully', async () => {
      const verifiedUser = {
        ...mockUser,
        is_verified: true,
      };

      mockUserService.findOneByEmail.mockResolvedValue(verifiedUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      mockJWTService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.signin(mockSigninDto);

      const expectedPayload = {
        userId: verifiedUser.user_id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
      };

      expect(result).toEqual({
        message: USER.LOGGED_IN,
        payload: {
          token: 'jwt_token',
          user: expectedPayload,
        },
      });

      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(mockJWTService.signAsync).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('verifyUser', () => {
    const uniqueString = 'test-unique-string';

    it('should throw NotFoundException if user verification does not exist', async () => {
      mockUserVerificationService.findOneByUniqueString.mockResolvedValue(null);

      await expect(service.verifyUser(uniqueString)).rejects.toThrow(
        NotFoundException,
      );

      expect(
        mockUserVerificationService.findOneByUniqueString,
      ).toHaveBeenCalledWith(uniqueString);
    });

    it('should throw ConflictException if user is already verified', async () => {
      const mockUserVerifyData = {
        ...mockUserVerify,
        user: {
          ...mockUser,
          is_verified: true,
        },
      };

      mockUserVerificationService.findOneByUniqueString.mockResolvedValue(
        mockUserVerifyData,
      );

      await expect(service.verifyUser(uniqueString)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if token is expired and create new verification', async () => {
      const expiredDate = new Date(Date.now() - 1000); // Past date
      const mockUserVerifyData = {
        ...mockUserVerify,
        user: {
          ...mockUser,
          is_verified: false,
        },
        expiring_at: expiredDate,
      };

      mockUserVerificationService.findOneByUniqueString.mockResolvedValue(
        mockUserVerifyData,
      );
      mockUserVerificationService.deleteOne.mockResolvedValue(true);
      mockMailService.sendMail.mockResolvedValue(true);
      mockUserVerificationService.create.mockResolvedValue(mockUserVerify);

      await expect(service.verifyUser(uniqueString)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockUserVerificationService.deleteOne).toHaveBeenCalled();
      expect(mockMailService.sendMail).toHaveBeenCalled();
      expect(mockUserVerificationService.create).toHaveBeenCalled();
    });

    it('should verify user successfully', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const mockUserVerifyData = {
        ...mockUserVerify,
        user: {
          ...mockUser,
          is_verified: false,
        },
        expiring_at: futureDate,
      };

      mockUserVerificationService.findOneByUniqueString.mockResolvedValue(
        mockUserVerifyData,
      );
      mockUserVerificationService.deleteOne.mockResolvedValue(true);

      const result = await service.verifyUser(uniqueString);

      expect(result).toEqual({
        message: USER_VERIFY.VERIFIED,
      });

      expect(
        mockUserVerificationService.findOneByUniqueString,
      ).toHaveBeenCalledWith(uniqueString);
      expect(mockUserVerificationService.deleteOne).toHaveBeenCalledWith(
        mockUserVerify.user_verify_id,
      );

      expect(mockUserVerifyData.user.is_verified).toBe(true);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
