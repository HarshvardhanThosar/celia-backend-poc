import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RetailService } from './retail.service';
import { PurchaseItemDTO } from './dto/purchase-item.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { KeycloakUser } from 'nest-keycloak-connect';
import { KeycloakAuthUser } from 'src/keycloak/types/user';

@Controller('retail')
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Get('/items')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_available_items(
    @Query('page') page = 0,
    @Query('page_size') pageSize = 10,
  ) {
    return await this.retailService.get_available_items(page, pageSize);
  }

  @Get('/items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async get_item_by_id(@Param('id') id: string) {
    const item = await this.retailService.get_item_by_id(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  @Post('/buy/:item_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async purchase_item(
    @Param('item_id') itemId: string,
    @Body() body: PurchaseItemDTO,
    @KeycloakUser() user: KeycloakAuthUser,
  ) {
    if (body.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    return await this.retailService.purchase_item(
      itemId,
      body.quantity,
      user.sub,
    );
  }
}
