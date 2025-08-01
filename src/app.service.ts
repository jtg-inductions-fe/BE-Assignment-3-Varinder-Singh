import { HttpCode, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    @HttpCode(200)
    healthCheck(): { message: string } {
        return { message: 'app is running!' };
    }
}
