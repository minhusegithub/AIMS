import { Controller, Get, Query, Res, Post, Body } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Response } from 'express';

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('create-payment-url')
  createPaymentUrl(
   
    @Query('orderId') orderId: string,
  ) {
    return this.vnpayService.createPaymentUrl( orderId);
  }

  @Get('return')
  async vnpayReturn(@Query() query: any) {
    return this.vnpayService.handleReturnUrl(query);
  }
}
