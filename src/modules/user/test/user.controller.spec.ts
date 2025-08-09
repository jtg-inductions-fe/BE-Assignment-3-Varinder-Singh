import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { USER } from '@constants/responseMessages.const';
import { TestUser } from '@modules/auth/test/entities/testUser.entity';
import { TestUserVerify } from '@modules/auth/test/entities/testUserVerify.entity';
import { createTestModule } from '@modules/user/test/createTestModule.utils';

import { UserType } from '../types/user.types';

const user: UserType & { user_id: string } = {
  user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Test@1234',
  role: 'buyer',
  is_verified: false,
};

describe('UserController (integration)', () => {
  let appModule: INestApplication<App>;
  let userRepository: Repository<TestUser>;
  let userVerifyRepository: Repository<TestUserVerify>;

  beforeAll(async () => {
    const { app, module } = await createTestModule();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    appModule = app;
    userRepository = module.get(getRepositoryToken(TestUser));
    userVerifyRepository = module.get(getRepositoryToken(TestUserVerify));
  });

  beforeEach(async () => {
    await userVerifyRepository.query(
      'TRUNCATE TABLE test_user_verify CASCADE;',
    );
    await userRepository.query('TRUNCATE TABLE test_user CASCADE;');
    jest.clearAllMocks();
  });

  describe('GET /user/:email', () => {
    it('should return 200 with user data if user exists', async () => {
      await userRepository.save({ ...user, is_verified: true });

      const res = await request(appModule.getHttpServer())
        .get(`/user/${user.email}`)
        .expect(200);

      expect(res.body).toMatchObject({ ...user, is_verified: true });
    });
  });

  describe('PATCH /user/:userId', () => {
    it('should update the user and return updated user', async () => {
      await userRepository.save({ ...user, is_verified: true });

      const updatedUserData = {
        phone: '12345678901',
        address: 'Updated Address',
      };

      const res = await request(appModule.getHttpServer())
        .patch(`/user/${user.user_id}`)
        .send(updatedUserData)
        .expect(200);

      expect(res.body).toMatchObject({
        message: USER.UPDATED,
      });
    });
  });

  describe('DELETE /user/:userId', () => {
    it('should return affected = 1 if user is deleted', async () => {
      await userRepository.save({ ...user, is_verified: true });

      const res = await request(appModule.getHttpServer())
        .delete(`/user/${user.user_id}`)
        .expect(200);

      expect(res.body).toEqual({
        raw: [],
        affected: 1,
      });
    });

    it('should return 400 if no user is deleted', async () => {
      const res = await request(appModule.getHttpServer())
        .delete(`/user/${user.user_id}`)
        .expect(400);

      expect((res.body as { message: string }).message).toMatch(
        USER.DELETE_ERROR,
      );
    });
  });

  afterAll(async () => {
    await userVerifyRepository.query(
      'TRUNCATE TABLE test_user_verify CASCADE;',
    );
    await userRepository.query('TRUNCATE TABLE test_user CASCADE;');
    await appModule.close();
  });
});
