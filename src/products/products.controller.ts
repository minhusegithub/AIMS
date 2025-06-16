import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //Create a new product
  @Post()
  @ResponseMessage('Create a new product')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }


  //Get all products
  @Get()
  @ResponseMessage('Fetch products with pagination')
  findAll(
    @Query('current') currentPage: string ,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.productsService.findAll(+currentPage, +limit, qs);
  }



  //Get a product by id
  @Get(':id')
  @ResponseMessage('Fetch a product by id')
  findOne(
    @Param('id') id: string
  ) {
    return this.productsService.findOne(id);
  }

  //Update a product
  @Patch(':id')
  @ResponseMessage('Update a product by id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  //Delete a product
  @Delete(':id')
  @ResponseMessage('Delete a product by id')
  remove(
    @Param('id') id: string
  ) {
    return this.productsService.remove(id);
  }
}
