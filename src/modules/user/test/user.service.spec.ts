import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { USER } from '@constants/responseMessages.const';

import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UserType } from '../types/user.types';

describe('UserService (unit)', () => {
  let service: UserService;

  const mockUserRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockUser: UserType & { user_id: string } = {
    user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
    name: 'varinder',
    email: 'virenderdhillon104@gmail.com',
    password: 'strong-password',
    role: 'seller',
    is_verified: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findOneByEmail(mockUser.email)).resolves.toEqual(
        mockUser,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });

  describe('findOneById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findOneById(mockUser.user_id)).resolves.toEqual(
        mockUser,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        user_id: mockUser.user_id,
      });
    });
  });

  describe('create', () => {
    it('should return user if created successfully', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      await expect(service.create(mockUser)).resolves.toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateOne', () => {
    it('should return user if updated successfully', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOneBy.mockResolvedValue(updatedUser);

      const updateData = {
        phone: '+919291947322',
        address: 'block 10',
      };

      await expect(
        service.updateOne(mockUser.user_id, updateData),
      ).resolves.toEqual(updatedUser);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { user_id: mockUser.user_id },
        updateData,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        user_id: mockUser.user_id,
      });
    });

    it('should throw BadRequestException if update fails', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updateOne(mockUser.user_id, { name: 'test' }),
      ).rejects.toThrow(new BadRequestException(USER.UPDATE_ERROR));
    });
  });

  describe('delete', () => {
    it('should return result if deleted successfully', async () => {
      const deleteResult = { affected: 1 };
      mockUserRepository.delete.mockResolvedValue(deleteResult);

      await expect(service.delete(mockUser.user_id)).resolves.toEqual(
        deleteResult,
      );
      expect(mockUserRepository.delete).toHaveBeenCalledWith({
        user_id: mockUser.user_id,
      });
    });

    it('should throw BadRequestException if no rows affected', async () => {
      const deleteResult = { affected: 0 };
      mockUserRepository.delete.mockResolvedValue(deleteResult);

      await expect(service.delete(mockUser.user_id)).rejects.toThrow(
        new BadRequestException(USER.DELETE_ERROR),
      );
    });
  });
});
