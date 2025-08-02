import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/services/user.service';
import { UserVerificationService } from '../../user/services/userVerification.service';
import { MailService } from '../../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { TestUser } from './entities/testUser.entity';
import { TestUserVerify } from './entities/testUserVerify.entity';
import { DEFAULT_DB_PORT } from '../../../constants/database.const';
import { User } from '../../user/entities/user.entity';
import { UserVerify } from '../../user/entities/userVerify.entity';
import { mockSigninDto } from 'mock/auth.mock';

const mockMailService = {
    sendMail: jest.fn().mockResolvedValue(true),
};

const mockJwtService = {
    signAsync: jest.fn(() => Promise.resolve('mock-jwt-token')),
    verify: jest.fn(() => ({ userId: 1 })),
};

describe('AuthController (integration)', () => {
    let app: INestApplication;
    let jwtService: JwtService;
    let userService: UserService;
    let userVerificationService: UserVerificationService;
    let userRepository: Repository<TestUser>;
    let userVerifyRepository: Repository<TestUserVerify>;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port:
                        parseInt(process.env.DB_PORT || '') || DEFAULT_DB_PORT,
                    username: 'root',
                    password: 'root',
                    database: 'testfeassignment3',
                    entities: [TestUser, TestUserVerify],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([TestUser, TestUserVerify]),
            ],
            controllers: [AuthController],
            providers: [
                AuthService,
                UserService,
                UserVerificationService,
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: getRepositoryToken(User),
                    useExisting: getRepositoryToken(TestUser),
                },
                {
                    provide: getRepositoryToken(UserVerify),
                    useExisting: getRepositoryToken(TestUserVerify),
                },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        jwtService = moduleRef.get(JwtService);
        userService = moduleRef.get(UserService);
        userVerificationService = moduleRef.get(UserVerificationService);
        userRepository = moduleRef.get(getRepositoryToken(TestUser));
        userVerifyRepository = moduleRef.get(
            getRepositoryToken(TestUserVerify),
        );
    });

    beforeEach(async () => {
        await userVerifyRepository.query(
            'TRUNCATE TABLE test_user_verify CASCADE;',
        );
        await userRepository.query('TRUNCATE TABLE test_user CASCADE;');
    });

    const user = {
        user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Test@1234',
        role: 'buyer',
    };

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

            expect(res.body.message).toBe(
                'User registered successfully. Please verify your email to activate your account.',
            );

            const createdUser = await userService.findOne(user.email);
            expect(createdUser).toBeDefined();
            expect(createdUser?.email).toBe(user.email);
            expect(createdUser?.name).toBe(user.name);
            expect(createdUser?.is_verified).toBe(false);

            expect(mockMailService.sendMail).toHaveBeenCalled();
        });
    });

    describe('verify user', () => {
        it('/GET /verify/:uniqueString should verify the user', async () => {
            await request(app.getHttpServer())
                .post('/signup')
                .send(user)
                .expect(201);

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

            expect(res.body.message).toBe('User verified successfully');

            const verifiedUser = await userService.findOne(user.email);
            expect(verifiedUser?.is_verified).toBe(true);
        });
    });

    describe('signin', () => {
        it("/POST /signin should throw UnauthorizedException if password doesn't match", async () => {
            await request(app.getHttpServer())
                .post('/signup')
                .send({ ...user, is_verified: true })
                .expect(201);

            mockSigninDto.password = 'not-strong-password';
            const res = await request(app.getHttpServer())
                .post('/signin')
                .send(mockSigninDto)
                .expect(401);

            expect(res.body.message).toBe('Invalid email or password.');
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
