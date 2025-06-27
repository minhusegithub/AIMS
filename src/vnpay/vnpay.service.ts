import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders.service';
import { dateFormat, ProductCode, VNPay, VnpLocale } from 'vnpay';

@Injectable()
export class VnpayService {
  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrdersService


  ) {
}

  async createPaymentUrl(orderId: string) {

    const order = await this.orderService.findOne(orderId);
    if (typeof order === 'string') {
      // Xử lý trường hợp không tìm thấy đơn hàng
      console.log(order);
      throw new Error(order);
    }

    const vnpay = new VNPay({
      // Thông tin cấu hình bắt buộc
      tmnCode: this.configService.get<string>('VNPAY_TMNCODE'),
      secureSecret: this.configService.get<string>('VNPAY_HASH_SECRET'),
      vnpayHost: this.configService.get<string>('VNPAY_URL'),
      
      // Cấu hình tùy chọn
     testMode: true,  // Chế độ test
    //  hashAlgorithm: "SHA512",  // Thuật toán mã hóa
    //  logger: ignoreLogger, // Hàm xử lý log tùy chỉnh


     // Tùy chỉnh endpoints cho từng phương thức API (mới)
     // Hữu ích khi VNPay thay đổi endpoints trong tương lai
     endpoints: {
         paymentEndpoint: 'paymentv2/vpcpay.html',                 // Endpoint thanh toán
         queryDrRefundEndpoint: 'merchant_webapi/api/transaction', // Endpoint tra cứu & hoàn tiền
         getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list', // Endpoint lấy danh sách ngân hàng
     }
     
 });

 

 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const vnpayResponse = await vnpay.buildPaymentUrl(
     {
        vnp_Amount: order.totalPrice * 1000,
        vnp_IpAddr: "127.0.0.1",
        vnp_TxnRef: orderId + Date.now(), // là duy nhất
        vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow)
        
     }
 );
 
 return {
  "paymentUrl": vnpayResponse
  
     
 };
    


  }

  handleReturnUrl(query: Record<string, string>) {
    if(query.vnp_ResponseCode === "00"){ // Nếu thành công
      return { success: true, message: 'Thanh toán thành công!' , data: {
        
        "Số tiền thanh toán": (Number(query.vnp_Amount) / 100),
        "Mã đơn hàng": query.vnp_TxnRef , 
        "Ngày thanh toán": query.vnp_CreateDate,

      }};
    }else{
      return { success: false,
        message: 'Thanh toán thất bại!' ,
        data: { query}
      };
    }
    
    
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  }
}
