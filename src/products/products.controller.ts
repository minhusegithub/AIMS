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

  // Create a new product
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Tạo sản phẩm thành công')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
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
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Update a product
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật sản phẩm thành công')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // Update product stock
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật tồn kho thành công')
  updateStock(
    @Param('id') id: string,
    @Body() body: { stock: number },
  ) {
    return this.productsService.updateStock(id, body.stock);
  }

  // Update product price
  @Patch(':id/price')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật giá thành công')
  updatePrice(
    @Param('id') id: string,
    @Body() body: { price: number },
  ) {
    return this.productsService.updatePrice(id, body.price);
  }

  // Update product title
  @Patch(':id/title')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật tên sản phẩm thành công')
  updateTitle(
    @Param('id') id: string,
    @Body() body: { title: string },
  ) {
    return this.productsService.updateTitle(id, body.title);
  }

  // Update product description
  @Patch(':id/description')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật mô tả thành công')
  updateDescription(
    @Param('id') id: string,
    @Body() body: { description: string },
  ) {
    return this.productsService.updateDescription(id, body.description);
  }

  // Update product thumbnail
  @Patch(':id/thumbnail')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật hình ảnh thành công')
  updateThumbnail(
    @Param('id') id: string,
    @Body() body: { thumbnail: string },
  ) {
    return this.productsService.updateThumbnail(id, body.thumbnail);
  }

  // Delete a product
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Xóa sản phẩm thành công')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Get products sort by price with option
  @Post('sort-by-price')
  sortByPrice(
    @Query('option') option: string,
  ) {
    return this.productsService.sortByPrice(option);
  }

  // Get products sort by title with option
  @Post('sort-by-title')
  sortByTitle(
    @Query('option') option: string,
  ) {
    return this.productsService.sortByTitle(option);
  }

  // Search products by title
  @Post('search-by-title')
  searchByTitle(
    @Query('title') title: string,
  ) {
    return this.productsService.searchByTitle(title);
  }

  // Get products by stock status
  @Get('stock/:status')
  getProductsByStockStatus(
    @Param('status') status: 'in-stock' | 'out-of-stock' | 'low-stock',
  ) {
    return this.productsService.getProductsByStockStatus(status);
  }

  // Get product statistics
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  getProductStats() {
    return this.productsService.getProductStats();
  }
}
