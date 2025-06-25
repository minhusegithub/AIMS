import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Create a new product
  @Post()
  @Roles(Role.Admin, Role.ProductManager)
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
  @Roles(Role.Admin, Role.ProductManager)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // Delete a product
  @Delete(':id')
  @Roles(Role.Admin, Role.ProductManager)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  //Get products sort by price with option
  @Post('sort-by-price')
  sortByPrice(
    @Query('option') option: string,
  ) {
    return this.productsService.sortByPrice(option);
  }

  //Get products sort by title with option
  @Post('sort-by-title')
  sortByTitle(
    @Query('option') option: string,
  ) {
    return this.productsService.sortByTitle(option);
  }

  @Post('search-by-title')
  searchByTitle(
    @Query('title') title: string,
  ) {
    return this.productsService.searchByTitle(title);
  }

}
