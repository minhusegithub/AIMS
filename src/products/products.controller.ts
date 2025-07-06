import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  // Create product by admin 
  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Tạo sản phẩm thành công')
  createProductByAdmin(
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.createProductByAdmin(createProductDto);
  }

  // Get all products
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.productsService.findAll(+currentPage, +limit, qs);
  }

  // Get a product by id
  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.productsService.findOne(id);
  }

  // Update product by admin 
  @Patch('admin/update/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật sản phẩm thành công')
  updateProductByAdmin(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProductByAdmin(id, updateProductDto);
  }

  // Delete product by admin (tương tự updateProfile)
  @Delete('admin/delete/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Xóa sản phẩm thành công')
  deleteProductByAdmin(
    @Param('id') id: string
  ) {
    return this.productsService.deleteProductByAdmin(id);
  }


  // Get products sort by price with option
  @Post('sort-by-price')
  sortByPrice(
    @Query('option') option: string,
  ) {
    return this.productsService.sortByPrice(option);
  }

  // Get products sort by title with option
  // @Post('sort-by-title')
  // sortByTitle(
  //   @Query('option') option: string,
  // ) {
  //   return this.productsService.sortByTitle(option);
  // }
  

  // Search products by title
  @Post('search-by-title')
  searchByTitle(
    @Query('title') title: string,
  ) {
    return this.productsService.searchByTitle(title);
  }

 
}
