import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.ordersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.ordersService.findOne(id);
  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch('update-status/:id')
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: string
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch('place-rush-order/:id')
  placeRushOrder(
    @Param('id') id: string,
    @Query('placeRushOrder') placeRushOrder: boolean
  ) {
    return this.ordersService.placeRushOrder(id, placeRushOrder);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
