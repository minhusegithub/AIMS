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
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const isValid = this.vnpayService.validateReturnUrl(query);
    if (isValid) {
      return res.send('Thanh toán thành công!');
    } else {
      return res.status(400).send('Thanh toán thất bại hoặc sai chữ ký!');
    }
  }
}
