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
    const result = await this.vnpayService.handleReturnUrl(query);
    
    // Redirect đến trang frontend với thông tin kết quả
    if (result.redirectUrl) {
      return res.redirect(result.redirectUrl);
    }
    
    // Fallback nếu không có redirectUrl
    return res.redirect(`http://127.0.0.1:5500/frontend/vnpay-return.html?success=false&message=${encodeURIComponent('Lỗi xử lý thanh toán')}`);
  }
}