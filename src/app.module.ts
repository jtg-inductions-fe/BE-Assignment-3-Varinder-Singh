import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { DatabaseProvider } from '@common/database';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseProvider],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
