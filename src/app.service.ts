import { HttpCode, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  @HttpCode(200)
  healthCheck() {
    return { message: 'app is running!' };
  }
}
