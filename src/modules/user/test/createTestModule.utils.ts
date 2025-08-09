import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';

import { mockMailService } from '@mock/auth.mock';
import { MailService } from '@modules/mail/mail.service';
import { createTestApp } from '@test/createTestModule';

export const createTestModule = async (): Promise<{
  app: INestApplication<App>;
  module: TestingModule;
}> => {
  return createTestApp({
    overrideProviders: [
      {
        provide: MailService,
        useValue: mockMailService,
      },
    ],
  });
};
