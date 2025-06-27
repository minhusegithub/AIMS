import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const {title, description, price, stock, thumbnail} = createProductDto;

    // Validate input
    if (price < 0) {
      throw new BadRequestException('Giá sản phẩm không được âm');
    }
    if (stock < 0) {
      throw new BadRequestException('Số lượng tồn kho không được âm');
    }
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Tên sản phẩm không được để trống');
    }

    const newProduct = await this.productModel.create({
      title: title.trim(),
      description: description?.trim() || '',
      price,
      stock,
      thumbnail: thumbnail || 'https://via.placeholder.com/200x180'
    });
    
    return {
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: newProduct
    };
  }

  // Create product by admin (tương tự updateProfile)
  async createProductByAdmin(createProductDto: CreateProductDto) {
    const {title, description, price, stock, thumbnail} = createProductDto;

   

    const newProduct = await this.productModel.create({
      title: title.trim(),
      description: description?.trim() || '',
      price,
      stock,
      thumbnail: thumbnail || 'https://via.placeholder.com/200x180'
    });
    
    return {
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: newProduct
    };
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
      throw new NotFoundException('ID sản phẩm không hợp lệ');
    }
    const product = await this.productModel.findOne({_id: id});
    if(!product){
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return {
      success: true,
      data: product
    };
  }

  // Update product by admin (tương tự updateProfile)
  async updateProductByAdmin(id: string, updateProductDto: UpdateProductDto) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new NotFoundException('ID sản phẩm không hợp lệ');
    }

    // Validate input
    if (updateProductDto.price !== undefined && updateProductDto.price < 0) {
      throw new BadRequestException('Giá sản phẩm không được âm');
    }
    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('Số lượng tồn kho không được âm');
    }
    if (updateProductDto.title !== undefined && (!updateProductDto.title || updateProductDto.title.trim().length === 0)) {
      throw new BadRequestException('Tên sản phẩm không được để trống');
    }

    // Check if product exists
    const existingProduct = await this.productModel.findOne({_id: id});
    if(!existingProduct){
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Prepare update data
    const updateData: any = {};
    if (updateProductDto.title !== undefined) {
      updateData.title = updateProductDto.title.trim();
    }
    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description.trim();
    }
    if (updateProductDto.price !== undefined) {
      updateData.price = updateProductDto.price;
    }
    if (updateProductDto.stock !== undefined) {
      updateData.stock = updateProductDto.stock;
    }
    if (updateProductDto.thumbnail !== undefined) {
      updateData.thumbnail = updateProductDto.thumbnail;
    }

    // Update product
    const result = await this.productModel.updateOne({_id: id}, updateData);
    
    if(result.modifiedCount === 0) {
      throw new BadRequestException('Không có thay đổi nào được cập nhật');
    }

    // Get updated product
    const updatedProduct = await this.productModel.findOne({_id: id});
    
    return {
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct
    };
  }

  // Delete product by admin (tương tự updateProfile)
  async deleteProductByAdmin(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new NotFoundException('ID sản phẩm không hợp lệ');
    }

    // Check if product exists
    const existingProduct = await this.productModel.findOne({_id: id});
    if(!existingProduct){
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Soft delete product
    const result = await this.productModel.softDelete({_id: id});
    
    return {
      success: true,
      message: 'Xóa sản phẩm thành công',
      data: result
    };
  }



  // sort by price
  async sortByPrice(option: string) {
    // Chuyển đổi giá trị By về 1 hoặc -1
    const sortValue = option === 'desc' ? -1 : 1;
    const products = await this.productModel.find().sort({price: sortValue});
    return {
      success: true,
      data: products
    };
  }

   // sort by title
  async sortByTitle(option: string) {
    // Chuyển đổi giá trị By về 1 hoặc -1
    const sortValue = option === 'desc' ? 1 : -1;
    const products = await this.productModel.find().sort({ title: sortValue });
    return {
      success: true,
      data: products
    };
  }

  // search by title
  async searchByTitle(title: string) {
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
    }

    const products = await this.productModel.find({
      title: {$regex: title.trim(), $options: 'i'}
    });
    
    return {
      success: true,
      data: products,
      total: products.length
    };
  }

  
}
