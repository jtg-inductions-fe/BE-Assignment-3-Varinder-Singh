import { INestApplication, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

interface OverrideProvider<T = unknown> {
  provide: Type<T>;
  useValue: Partial<T>;
}

interface CreateTestAppOptions {
  overrideProviders?: OverrideProvider[];
}

export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<{
  app: INestApplication<App>;
  module: TestingModule;
}> {
  const createModule = Test.createTestingModule({
    imports: [AppModule],
  });

  if (options.overrideProviders) {
    for (const { provide, useValue } of options.overrideProviders) {
      createModule.overrideProvider(provide).useValue(useValue);
    }
  }
  const moduleRef = await createModule.compile();
  const app: INestApplication<App> = moduleRef.createNestApplication();

  await app.init();

  return {
    app,
    module: moduleRef,
  };
}
