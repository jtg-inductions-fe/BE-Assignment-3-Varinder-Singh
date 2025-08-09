import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { USER, USER_VERIFY } from '@constants/responseMessages.const';
import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';
import { createTestModule } from '@modules/user/test/createTestModule.utils';
import { UserType } from '@modules/user/types/user.types';

import { TestUser } from './entities/testUser.entity';
import { TestUserVerify } from './entities/testUserVerify.entity';

const user: UserType & { user_id: string } = {
  user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Test@1234',
  role: 'buyer',
  is_verified: false,
};

describe('AuthController (integration)', () => {
  let appModule: INestApplication<App>;
  let userService: UserService;
  let userVerificationService: UserVerificationService;
  let userRepository: Repository<TestUser>;
  let userVerifyRepository: Repository<TestUserVerify>;

  beforeAll(async () => {
    const { app, module } = await createTestModule();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    appModule = app;
    userService = module.get(UserService);
    userVerificationService = module.get(UserVerificationService);
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

  it('should be defined', () => {
    expect(appModule).toBeDefined();
    expect(userService).toBeDefined();
    expect(userVerificationService).toBeDefined();
  });

  describe('signup', () => {
    it('/POST /signup should create a user and send verification email', async () => {
      const res = await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty('message', USER.REGISTERED);

      const createdUser = await userService.findOneByEmail(user.email);
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(user.email);
      expect(createdUser?.name).toBe(user.name);
      expect(createdUser?.role).toBe(user.role);
      expect(createdUser?.is_verified).toBe(false);

      const verification = await userVerifyRepository.findOne({
        where: {
          user: { user_id: createdUser?.user_id },
        },
      });
      expect(verification).toBeDefined();
      expect(verification?.unique_string).toBeDefined();
    });

    it('/POST /signup should return 409 if user already exists', async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(409);
    });
  });

  describe('verify user', () => {
    it('/GET /verify/:uniqueString should verify the user', async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);

      const dbUser = await userService.findOneByEmail(user.email);

      if (!dbUser) throw new Error('Db user is not defined');

      const verification = await userVerifyRepository.findOne({
        where: {
          user: { user_id: dbUser.user_id },
        },
      });
      expect(verification).toBeDefined();

      const res = await request(appModule.getHttpServer())
        .get(`/verify/${verification?.unique_string}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', USER_VERIFY.VERIFIED);

      const verifiedUser = await userService.findOneByEmail(user.email);
      expect(verifiedUser?.is_verified).toBe(true);

      const deletedVerification = await userVerifyRepository.findOne({
        where: {
          user: { user_id: dbUser.user_id },
        },
      });
      expect(deletedVerification).toBeNull();
    });

    it('/GET /verify/:uniqueString should return 404 for invalid token', async () => {
      await request(appModule.getHttpServer())
        .get('/verify/invalid-unique-string')
        .expect(404);
    });

    it('/GET /verify/:uniqueString should return 409 if user already verified', async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);
      await userRepository.update({ email: user.email }, { is_verified: true });

      const dbUser = await userService.findOneByEmail(user.email);
      const verification = await userVerifyRepository.findOne({
        where: {
          user: { user_id: dbUser?.user_id },
        },
      });

      await request(appModule.getHttpServer())
        .get(`/verify/${verification?.unique_string}`)
        .expect(409);
    });
  });

  describe('signin', () => {
    it('/POST /signin should return token and success message if credentials are valid', async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);
      await userRepository.update({ email: user.email }, { is_verified: true });

      await request(appModule.getHttpServer())
        .post('/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
    });

    it("/POST /signin should throw UnauthorizedException if password doesn't match", async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);
      await userRepository.update({ email: user.email }, { is_verified: true });

      await request(appModule.getHttpServer())
        .post('/signin')
        .send({
          email: user.email,
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('/POST /signin should throw NotFoundException if user does not exist', async () => {
      await request(appModule.getHttpServer())
        .post('/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        })
        .expect(404);
    });

    it('/POST /signin should throw ForbiddenException if user is not verified', async () => {
      await request(appModule.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);
      await request(appModule.getHttpServer())
        .post('/signin')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(403);
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
