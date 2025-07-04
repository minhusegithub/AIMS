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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Tạo mới orer
  @Post()
  @Roles(Role.Customer)
  create(
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(createOrderDto);
  }


  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.ordersService.findOne(id);
  }

 
  //Cập nhật trạng thái order
  @Patch('update-status/:id')
  @Roles(Role.Admin)
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

 

  
}
