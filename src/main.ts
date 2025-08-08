import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from 'app.module';

import { DEFAULT_PORT } from '@constants/app.const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? DEFAULT_PORT;
  app.useLogger(new Logger());

  await app.listen(PORT).then(() => {
    Logger.log(`App is running on http://localhost:${PORT}`);
  });
}
void bootstrap();
