import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { TestUser } from '@modules/auth/test/entities/testUser.entity';
import { TestUserVerify } from '@modules/auth/test/entities/testUserVerify.entity';

import { createTestModule } from '../../../utils/createTestModule';
import { UserType } from '../types/user.types';

const user: UserType & { user_id: string } = {
  user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Test@1234',
  role: 'buyer',
  is_verified: false,
};

describe('UserController', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<TestUser>;
  let userVerifyRepository: Repository<TestUserVerify>;

  beforeAll(async () => {
    const moduleRef = await createTestModule();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleRef.get(getRepositoryToken(TestUser));
    userVerifyRepository = moduleRef.get(getRepositoryToken(TestUserVerify));
  });

  beforeEach(async () => {
    await userVerifyRepository.query(
      'TRUNCATE TABLE test_user_verify CASCADE;',
    );
    await userRepository.query('TRUNCATE TABLE test_user CASCADE;');
  });

  describe('updateOne', () => {
    it('should update a user and return the result', async () => {
      await request(app.getHttpServer())
        .post('/signup')
        .send({ ...user, is_verified: true })
        .expect(201);

      const updatedUser = {
        user_id: user.user_id,
        name: 'Updated Name',
      };

      await request(app.getHttpServer())
        .put(`/users/${user.user_id}`)
        .send({ name: 'Updated Name' })
        .expect(updatedUser);
    });
  });

  describe('delete', () => {
    it('should return affected rows = 1 if user is deleted', async () => {
      await request(app.getHttpServer())
        .post('/signup')
        .send({ ...user, is_verified: true })
        .expect(201);

      const result = {
        raw: {},
        affected: 1,
      };

      await request(app.getHttpServer())
        .put(`/users/${user.user_id}`)
        .expect(result);
    });

    it('should return affected rows = 0 if no user is deleted', async () => {
      await request(app.getHttpServer())
        .post('/signup')
        .send({ ...user, is_verified: true })
        .expect(201);

      const result = {
        raw: {},
        affected: 0,
      };

      await request(app.getHttpServer())
        .delete(`/users/${user.user_id}`)
        .expect(result);
    });
  });
});
