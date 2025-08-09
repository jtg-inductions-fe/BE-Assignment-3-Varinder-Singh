import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from 'app.module';
import { ErrorInterceptor } from 'interceptors/error.interceptor';

import { DEFAULT_PORT } from '@constants/app.const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? DEFAULT_PORT;
  app.useLogger(new Logger());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.listen(PORT).then(() => {
    Logger.log(`App is running on http://localhost:${PORT}`);
  });
}
void bootstrap();
