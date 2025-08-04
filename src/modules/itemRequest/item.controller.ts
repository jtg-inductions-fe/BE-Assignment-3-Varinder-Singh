import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from 'decorators/roles.decorator';
import { AuthGuard } from 'guards/auth.guard';
import { AuthenticatedRequest } from 'guards/types/authenticatedRequest.types';

import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(AuthGuard)
  @Roles(['buyer'])
  @Post()
  create(
    @Body() createItemDto: CreateItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itemService.create(createItemDto, request);
  }

  @UseGuards(AuthGuard)
  @Roles(['seller', 'admin'])
  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['buyer', 'admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Roles(['buyer'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(id, updateItemDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['buyer', 'admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.itemService.delete(id);
  }
}
