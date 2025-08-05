import { INestApplication } from '@nestjs/common';

import * as request from 'supertest';
import { App } from 'supertest/types';

import { createTestModule } from '@utils/createTestModule.utils';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await createTestModule();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET /health', async () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ message: 'app is running!' });
  });

  afterAll(() => {
    app.close();
  });
});
