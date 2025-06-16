import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { Cart } from 'src/carts/schemas/cart.schema';
import { Product } from 'src/products/schemas/product.schema';
import mongoose from 'mongoose';

@Injectable()
export class OrdersService {
  

  constructor(
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    private cartsService: CartsService,
    private productsService: ProductsService
  ) {}

  
  // create a new order
  async create(createOrderDto: CreateOrderDto) {
    const { cartId, placeRushOrder, paymentMethod } = createOrderDto;

    // Lấy thông tin giỏ hàng
    const cartResult = await this.cartsService.findOne(cartId);
    if (typeof cartResult === 'string' || !cartResult) {
      throw new NotFoundException('Cart not found');
    }
    const cart = cartResult as Cart;

    // Tính tổng giá trị đơn hàng
    let totalPrice = cart.products.reduce(
      (acc, item) => {
        // Kiểm tra xem productId có phải là object đã được populate không
        if (typeof item.productId === 'object' && item.productId !== null) {
          const product = item.productId as unknown as Product;
          return acc + (product.price * item.quantity);
        }
        throw new NotFoundException(`Product information not found for item in cart`);
      },
      0
    );

    // Thêm phí nếu là đơn gấp (20% của tổng giá trị)
    if (placeRushOrder) {
      totalPrice = totalPrice + (totalPrice * 0.2);
    }

    // Tạo đơn hàng mới
    const newOrder = await this.orderModel.create({
      cartId,
      totalPrice,
      placeRushOrder,
      paymentMethod
    });

    return newOrder;
  }




  




  
  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
