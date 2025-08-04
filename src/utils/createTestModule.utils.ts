import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { mockMailService } from '@mock/auth.mock';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { TestUser } from '@modules/auth/test/entities/testUser.entity';
import { TestUserVerify } from '@modules/auth/test/entities/testUserVerify.entity';
import { MailService } from '@modules/mail/mail.service';
import { User } from '@modules/user/entities/user.entity';
import { UserVerify } from '@modules/user/entities/userVerify.entity';
import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';
import { UserController } from '@modules/user/user.controller';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';

export const createTestModule = async (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),

      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET'),
        }),
        inject: [ConfigService],
      }),

      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [TestUser, TestUserVerify],
          synchronize: true,
        }),
      }),
      TypeOrmModule.forFeature([TestUser, TestUserVerify]),
    ],

    controllers: [AppController, AuthController, UserController],
    providers: [
      AppService,
      AuthService,
      UserService,
      UserVerificationService,
      JwtService,
      {
        provide: MailService,
        useValue: mockMailService,
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
};
