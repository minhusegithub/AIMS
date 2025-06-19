import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';

@Injectable()
export class CartsService {


  constructor(
    @InjectModel(Cart.name) private cartModel: SoftDeleteModel<CartDocument>,
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
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

  

  // add to cart
  async addToCart(id: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findOne({_id: id});
    if(!cart){
      return "not found cart";
    }

    const product = await this.productModel.findOne({_id: productId});
    if(!product){
      return "not found product";
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingProduct = cart.products.find(item => item.productId.toString() === productId);
    
    if (existingProduct) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      existingProduct.quantity = quantity;
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm mới vào giỏ hàng
      cart.products.push({
        productId: product._id,
        quantity: quantity
      });
    }

    // Lưu giỏ hàng đã cập nhật
    await cart.save();

    // Populate thông tin sản phẩm trước khi trả về
    const updatedCart = await this.cartModel.findById(cart._id)
      .populate({
        path: 'products.productId',
        select: '_id title price'
      });

    return updatedCart;
  }


  // delete a cart
  async remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found cart";
    }
    return await this.cartModel.softDelete({_id: id});
  }




}
