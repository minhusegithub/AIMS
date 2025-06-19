import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ResponseMessage('Create a new cart')
  create(
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartsService.create(createCartDto);
  }


  @Get(':id')
  @ResponseMessage('Get a cart by id')
  findOne(
    @Param('id') id: string
  ) {
    return this.cartsService.findOne(id);
  }


  @Patch('update-cart/:id')
  addToCart(
    @Param('id') id: string,
    @Query('productId') productId: string,
    @Query('quantity') quantity: number
  ) {
    return this.cartsService.addToCart(id, productId, quantity);
  }

  @Delete(':id')
  @ResponseMessage('Delete a cart by id')
  remove(
    @Param('id') id: string
  ) {
    return this.cartsService.remove(id);
  }
}
