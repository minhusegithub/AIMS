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
import aqp from 'api-query-params';

@Injectable()
export class OrdersService {
  

  constructor(
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    private cartsService: CartsService

    
  ) {}

  // calculate total price
  private calculateTotalPrice(cart: Cart, placeRushOrder: boolean): number {
    let totalPrice = cart.products.reduce(
      (acc, item) => {
        if (typeof item.productId === 'object' && item.productId !== null) {
          const product = item.productId as unknown as Product;
          return acc + (product.price * item.quantity);
        }
        return acc;
      },
      0
    );

    // Thêm phí nếu là đơn gấp (10% của tổng giá trị)
    if (placeRushOrder) {
      totalPrice = totalPrice + (totalPrice * 0.1);
    }

    return totalPrice;
  }


  
  
  async create(createOrderDto: CreateOrderDto) {
    const { cartId, placeRushOrder, paymentMethod } = createOrderDto;

    // Lấy thông tin giỏ hàng
    const cartResult = await this.cartsService.findOne(cartId);
    if (typeof cartResult === 'string' || !cartResult) {
      throw new NotFoundException('Cart not found');
    }
    const cart = cartResult as Cart;

    // Tính tổng giá trị đơn hàng sử dụng phương thức calculateTotalPrice
    const totalPrice = this.calculateTotalPrice(cart, placeRushOrder);

    // Tạo đơn hàng mới
    const newOrder = await this.orderModel.create({
      cartId,
      totalPrice,
      placeRushOrder,
      paymentMethod,
      status: 'pending'
    });

    return newOrder;
  }

  
  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort,  population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    
    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    
    const result = await this.orderModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: +currentPage,
        pageSize: +limit,
        pages: totalPages,
        total: totalItems,
        
      },
      result
    }
  }

  

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found order";
    }
    const order = await this.orderModel.findOne({_id: id})
      .populate({
        path: 'cartId',
        populate: [
          {
            path: 'userId',
            select: '_id name email'
          },
          {
            path: 'products.productId',
            select: 'title price'
          }
        ]
      });
    
    if (!order) {
      return "not found order";
    }

    
    const cart = order.cartId as any;
    const newTotalPrice = this.calculateTotalPrice(cart, order.placeRushOrder);

    // Chỉ cập nhật nếu totalPrice thay đổi
    if (order.totalPrice !== newTotalPrice) {
      order.totalPrice = newTotalPrice;
      await order.save();
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found order";
    }
    const order = await this.orderModel.updateOne({_id: id}, updateOrderDto);
    return order;
  }


  async updateStatus(id: string, status: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found order";
    }
    const order = await this.orderModel.updateOne({_id: id}, {status: status});
    return order;
  }


  async placeRushOrder(id: string, placeRushOrder: boolean) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found order";
    }
    const order = await this.orderModel.updateOne({_id: id}, {placeRushOrder: placeRushOrder});
    return order;
  }
  
  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
