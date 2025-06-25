import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  // create a new product
  async create(createProductDto: CreateProductDto) {
    const {title, description, price, stock} = createProductDto;

    const newProduct = await this.productModel.create({title, description, price, stock});
    return newProduct;
  }

  // get all products
  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort,  population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    
    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    
    const result = await this.productModel.find(filter)
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

  // get a product by id
  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found product";
    }
    const product = await this.productModel.findOne({_id: id});
    if(!product){
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // update a product
  async update(id: string, updateProductDto: UpdateProductDto) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found product";
    }
    const product = await this.productModel.updateOne({_id: id}, updateProductDto);
    if(!product){
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // delete a product
  async remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found product";
    }
    return await this.productModel.softDelete({_id: id});
  }

  // sort by price
  async sortByPrice(option: string) {
    // Chuyển đổi giá trị By về 1 hoặc -1
    const sortValue = option === 'desc' ? -1 : 1;
    const products = await this.productModel.find().sort({price: sortValue});
    return products;
  }

   // sort by price
  async sortByTitle(option: string) {
    // Chuyển đổi giá trị By về 1 hoặc -1
    const sortValue = option === 'desc' ? -1 : 1;
    const products = await this.productModel.find().sort({ title: sortValue });
    return products;
  }

  // search by title
  async searchByTitle(title: string) {
    const products = await this.productModel.find({title: {$regex: title, $options: 'i'}});
    return products;
  }


}
