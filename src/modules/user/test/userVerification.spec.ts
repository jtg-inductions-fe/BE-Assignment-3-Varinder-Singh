import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { USER_VERIFY } from '@constants/responseMessages.const';
import { mockUser } from '@mock/auth.mock';

import { UserVerify } from '../entities/userVerify.entity';
import { UserVerificationService } from '../services/userVerification.service';

describe('UserVerificationService (unit)', () => {
  let service: UserVerificationService;

  const mockUserVerifyRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserVerify = {
    user_verify_id: 'user_verify_id',
    unique_string: 'unique_string',
    expiring_at: new Date('2025-08-08T18:41:51.821Z'),
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserVerificationService,
        {
          provide: getRepositoryToken(UserVerify),
          useValue: mockUserVerifyRepository,
        },
      ],
    }).compile();

    service = module.get<UserVerificationService>(UserVerificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByUniqueString', () => {
    it('should return user verification if found', async () => {
      mockUserVerifyRepository.findOne.mockResolvedValue(mockUserVerify);

      await expect(
        service.findOneByUniqueString('unique_string'),
      ).resolves.toEqual(mockUserVerify);

      expect(mockUserVerifyRepository.findOne).toHaveBeenCalledWith({
        where: { unique_string: 'unique_string' },
        relations: ['user'],
      });
    });

    it('should return null if user verification is not found', async () => {
      mockUserVerifyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByUniqueString('nonexistent'),
      ).resolves.toBeNull();

      expect(mockUserVerifyRepository.findOne).toHaveBeenCalledWith({
        where: { unique_string: 'nonexistent' },
        relations: ['user'],
      });
    });
  });

  describe('create', () => {
    it('should return created user verification', async () => {
      const input = {
        user: mockUserVerify.user,
        unique_string: mockUserVerify.unique_string,
        expiring_at: mockUserVerify.expiring_at,
      };

      mockUserVerifyRepository.save.mockResolvedValue(mockUserVerify);

      const result = await service.create(input);

      expect(result).toEqual(mockUserVerify);
      expect(mockUserVerifyRepository.save).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteOne', () => {
    it('should return affected = 1 if user verification is deleted', async () => {
      const deleteResult = { raw: {}, affected: 1 };
      mockUserVerifyRepository.delete.mockResolvedValue(deleteResult);

      await expect(
        service.deleteOne(mockUserVerify.user_verify_id),
      ).resolves.toEqual(deleteResult);

      expect(mockUserVerifyRepository.delete).toHaveBeenCalledWith({
        user_verify_id: mockUserVerify.user_verify_id,
      });
    });

    it('should throw NotFoundException if nothing was deleted', async () => {
      const deleteResult = { raw: {}, affected: 0 };
      mockUserVerifyRepository.delete.mockResolvedValue(deleteResult);

      await expect(
        service.deleteOne(mockUserVerify.user_verify_id),
      ).rejects.toThrow(new NotFoundException(USER_VERIFY.VERIFIED_ALREADY));

      expect(mockUserVerifyRepository.delete).toHaveBeenCalledWith({
        user_verify_id: mockUserVerify.user_verify_id,
      });
    });
  });
});
