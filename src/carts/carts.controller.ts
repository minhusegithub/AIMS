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

  // Get current user's cart
  @Get('my-cart')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get current user cart')
  async getMyCart(
    @CurrentUser() user: any
  ) {
    try {
      const cart = await this.cartsService.getUserCart(user.userId);
      if (!cart) {
        return { success: false, message: 'Cart not found' };
      }
      return cart;
    } catch (error) {
      return { success: false, message: error?.message || 'Không thể lấy giỏ hàng' };
    }
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


  // Xóa sản phẩm khỏi giỏ hàng của user hiện tại
  @Delete('remove-product')
  @UseGuards(JwtAuthGuard)
  async removeProductFromCart(
    @CurrentUser() user: any,
    @Body('productId') productId: string
  ) {
    return this.cartsService.removeProductFromUserCart(user.userId, productId);
  }

  // Làm trống giỏ hàng của user hiện tại
  @Patch('clear')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Clear user cart')
  async clearMyCart(
    @CurrentUser() user: any
  ) {
    try {
      const result = await this.cartsService.clearUserCartItems(user.userId);
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error?.message || 'Không thể làm trống giỏ hàng' 
      };
    }
  }
}
