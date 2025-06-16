import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';

@Injectable()
export class CartsService {


  constructor(
    @InjectModel(Cart.name) private cartModel: SoftDeleteModel<CartDocument>,
  ) {}

  // create a new cart
  async create(createCartDto: CreateCartDto) {
    const {userId, products} = createCartDto;
    const newCart = await this.cartModel.create({userId, products});
    return newCart;
  }

  // get a cart by id
  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found cart";
    }
    const cart = await this.cartModel.findOne({_id: id})
      .populate('userId', '_id name email age gender address role')
      .populate({
        path: 'products.productId',
        select: 'title price'
      });
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  // update a cart
  async update(id: string, updateCartDto: UpdateCartDto) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found cart";
    }
    const cart = await this.cartModel.updateOne(
      {_id: id},
      updateCartDto
    );
    if(!cart){
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  // delete a cart
  async remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found cart";
    }
    return await this.cartModel.softDelete({_id: id});
  }
}
