import { Controller, Get } from '@nestjs/common';
import { AppService } from 'app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/hello')
    sayHello() {
        console.log('hello');
        return this.appService.sayHello();
    }
}
