import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { createTestModule } from 'utils/createTestModule';

import { mockSigninDto } from '@mock/auth.mock';
import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';
import { UserType } from '@modules/user/types/user.types';

import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';
import { UserType } from '@modules/user/types/user.types';
import { createTestModule } from '@utils/createTestModule.utils';

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
  let app: INestApplication<App>;
  let userService: UserService;
  let userVerificationService: UserVerificationService;
  let userRepository: Repository<TestUser>;
  let userVerifyRepository: Repository<TestUserVerify>;

  beforeAll(async () => {
    const moduleRef = await createTestModule();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userService = moduleRef.get(UserService);
    userVerificationService = moduleRef.get(UserVerificationService);
    userRepository = moduleRef.get(getRepositoryToken(TestUser));
    userVerifyRepository = moduleRef.get(getRepositoryToken(TestUserVerify));
  });

  beforeEach(async () => {
    await userVerifyRepository.query(
      'TRUNCATE TABLE test_user_verify CASCADE;',
    );
    await userRepository.query('TRUNCATE TABLE test_user CASCADE;');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(userService).toBeDefined();
    expect(userVerificationService).toBeDefined();
  });

  describe('signup', () => {
    it('/POST /signup should create a user and send verification email', async () => {
      const res = await request(app.getHttpServer())
        .post('/signup')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty(
        'message',
        'User registered successfully. Please verify your email to activate your account.',
      );

      const createdUser = await userService.findOne(user.email);
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(user.email);
      expect(createdUser?.name).toBe(user.name);
      expect(createdUser?.role).toBe(user.role);
    });
  });

  describe('verify user', () => {
    it('/GET /verify/:uniqueString should verify the user', async () => {
      await request(app.getHttpServer()).post('/signup').send(user).expect(201);

      const dbUser = await userService.findOne(user.email);

      if (!dbUser) throw new Error('Db user is not defined');

      const verification = await userVerifyRepository.findOne({
        where: {
          user: { user_id: dbUser.user_id },
        },
      });
      expect(verification).toBeDefined();

      const res = await request(app.getHttpServer())
        .get(`/verify/${verification?.unique_string}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'User verified successfully');

      const verifiedUser = await userService.findOne(user.email);
      expect(verifiedUser?.is_verified).toBe(true);
    });
  });

  describe('signin', () => {
    it('/POST /signin should return token and success message if credentials are valid', async () => {
      await request(app.getHttpServer()).post('/signup').send(user).expect(201);

      await userRepository.update({ email: user.email }, { is_verified: true });

      await request(app.getHttpServer())
        .post('/signin')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(201);
    });

    it("/POST /signin should throw UnauthorizedException if password doesn't match", async () => {
      await request(app.getHttpServer()).post('/signup').send(user).expect(201);

      await userRepository.update({ email: user.email }, { is_verified: true });

      await request(app.getHttpServer())
        .post('/signin')
        .send({
          email: user.email,
          password: 'wrong-password',
        })
        .expect(401);
    });
  });

  afterAll(async () => {
    await userVerifyRepository.query(
      'TRUNCATE TABLE test_user_verify CASCADE;',
    );
    await userRepository.query('TRUNCATE TABLE test_user CASCADE;');

    await app.close();
  });
});
