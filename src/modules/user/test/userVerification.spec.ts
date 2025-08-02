import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserVerificationService } from '../../user/services/userVerification.service';
import { UserVerify } from '../../user/entities/userVerify.entity';

describe('UserVerificationService', () => {
    let service: UserVerificationService;

    const mockUserVerifyRepository = {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
    };

    const mockUserVerify = {
        user_verify_id: 'user_verify_id',
        user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
        unique_string: 'unique_string',
        expiring_at: new Date(),
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
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return user verification if found', async () => {
            mockUserVerifyRepository.findOne.mockResolvedValue(mockUserVerify);

            await expect(service.findOne('unique_string')).resolves.toBe(
                mockUserVerify,
            );

            expect(mockUserVerifyRepository.findOne).toHaveBeenCalled();
        });

        it('should return null if user verification is not found', async () => {
            mockUserVerifyRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('unique_string')).resolves.toBe(null);

            expect(mockUserVerifyRepository.findOne).toHaveBeenCalled();
        });
    });
    describe('create', () => {
        it('should return user verification if created successfully', async () => {
            mockUserVerifyRepository.save.mockResolvedValue(mockUserVerify);

            await expect(
                service.create({
                    ...mockUserVerify,
                    user: {
                        name: 'varinder',
                        email: 'varinder@gmail.com',
                        password: '1234',
                        role: 'admin',
                        is_verified: false,
                    },
                }),
            ).resolves.toBe(mockUserVerify);
        });
    });

    describe('deleteOne', () => {
        it('should return affected rows 1 if user is deleted', async () => {
            mockUserVerifyRepository.delete.mockResolvedValue({
                raw: {},
                affected: 1,
            });

            await expect(
                service.deleteOne(mockUserVerify.user_verify_id),
            ).resolves.toStrictEqual({
                raw: {},
                affected: 1,
            });
        });

        it('should return affected rows 0 if user is not deleted', async () => {
            mockUserVerifyRepository.delete.mockResolvedValue({
                raw: {},
                affected: 0,
            });

            await expect(
                service.deleteOne(mockUserVerify.user_verify_id),
            ).resolves.toStrictEqual({
                raw: {},
                affected: 0,
            });
        });
    });
});
