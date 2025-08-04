import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UserType } from '../types/user.types';

describe('UserService (unit)', () => {
  let service: UserService;

  const mockUserRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
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

  describe('findOne', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findOne(mockUser.email)).resolves.toBe(mockUser);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(mockUser.email)).resolves.toBe(null);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });

  describe('create', () => {
    it('should return user if created successfully', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      await expect(service.create(mockUser)).resolves.toBe(mockUser);

      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return user if updated successfully', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      await expect(service.create(mockUser)).resolves.toBe(mockUser);
    });
  });
});
