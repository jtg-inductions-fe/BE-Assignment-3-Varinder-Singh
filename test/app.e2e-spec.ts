import { INestApplication, InternalServerErrorException } from '@nestjs/common';

import * as request from 'supertest';
import { App } from 'supertest/types';

import { AppService } from './../src/app.service';
import { createTestApp } from './createTestModule';

describe('AppController (e2e)', () => {
  let appModule: INestApplication<App>;
  let appService: AppService;

  beforeEach(async () => {
    const { app, module } = await createTestApp();

    appModule = app;
    appService = module.get<AppService>(AppService);
  });

  it('/GET /health should return 200 if app is running', async () => {
    return request(appModule.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ message: 'app is running!' });
  });

  it('/GET /health should return 500 if app is not running', async () => {
    jest.spyOn(appService, 'healthCheck').mockImplementation(() => {
      throw new InternalServerErrorException(
        'An error occured while running app',
      );
    });
    return request(appModule.getHttpServer()).get('/health').expect(500);
  });

  afterAll(() => {
    appModule.close();
  });
});
