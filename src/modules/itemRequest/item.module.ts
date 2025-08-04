import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthGuard } from 'guards/auth.guard';
import { RoleGuard } from 'guards/role.guard';

import { ItemRequest } from './entities/itemRequest.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemRequest]),
    JwtModule.register({
      secret: '6b6bfe63-8220-47ab-ab1e-239ce9a4b36c',
    }),
  ],
  controllers: [ItemController],
  providers: [ItemService, AuthGuard, RoleGuard],
})
export class ItemModule {}
