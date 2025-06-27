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

  // get user's cart
  async getUserCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId: userId, isDeleted: false })
      .populate('userId', '_id name email age gender address role')
      .populate({
        path: 'products.productId',
        select: '_id title price thumbnail'
      });

    // Nếu user chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        products: []
      });
      // Populate lại sau khi tạo mới
      cart = await this.cartModel.findById(cart._id)
        .populate('userId', '_id name email age gender address role')
        .populate({
          path: 'products.productId',
          select: '_id title price thumbnail'
        });
    }

    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }
    return cart;
  }


  // add product to user's cart
  async addProductToUserCart(userId: string, productId: string, quantity: number) {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        products: []
      });
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingProductIndex = cart.products.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingProductIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      cart.products[existingProductIndex].quantity += quantity;
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
      .populate('userId', '_id name email age gender address role')
      .populate({
        path: 'products.productId',
        select: '_id title price thumbnail'
      });

    return updatedCart;
  }

  // Xóa sản phẩm khỏi giỏ hàng của user hiện tại
  async removeProductFromUserCart(userId: string, productId: string) {
    let cart = await this.cartModel.findOne({ userId: userId, isDeleted: false });
    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }
    const index = cart.products.findIndex(item => item.productId.toString() === productId);
    if (index === -1) {
      return { success: false, message: 'Product not found in cart' };
    }
    cart.products.splice(index, 1);
    await cart.save();
    return { success: true };
  }

  // Lấy cart theo id
  async getCartById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const cart = await this.cartModel.findOne({ _id: id, isDeleted: false })
      .populate('userId', '_id name email age gender address role')
      .populate({
        path: 'products.productId',
        select: '_id title price thumbnail'
      });
    return cart;
  }
}
