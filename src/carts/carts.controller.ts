import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';

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

  // Get current user's cart
  @Get('my-cart')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get current user cart')
  getMyCart(@CurrentUser() user: any) {
    return this.cartsService.getUserCart(user.userId);
  }

  // Add product to current user's cart
  @Post('add-to-cart')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Add product to cart')
  addToMyCart(
    @CurrentUser() user: any,
    @Body() body: { productId: string; quantity: number }
  ) {
    return this.cartsService.addProductToUserCart(user.userId, body.productId, body.quantity);
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
