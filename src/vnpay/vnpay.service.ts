import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VnpayService {
  constructor(private readonly configService: ConfigService) {}

  createPaymentUrl(body: any) {
    const tmnCode = this.configService.get<string>('VNPAY_TMNCODE');
    const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
    const vnpUrl = this.configService.get<string>('VNPAY_URL');
    const returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');

    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = date.getTime().toString();

    const ipAddr = body.ipAddr || '127.0.0.1'; // giả định

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: body.orderInfo || 'Thanh toan don hang',
      vnp_OrderType: 'other',
      vnp_Amount: (body.amount * 100).toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort params
    const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {} as Record<string, string>);

    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('ENV HASH:', secretKey);
    console.log('signData:', signData);
    console.log('signed:', signed);
    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

    return { paymentUrl };
  }

  validateReturnUrl(query: Record<string, string>) {
    const secureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sorted = Object.keys(query).sort().reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {} as Record<string, string>);

    const signData = qs.stringify(sorted, { encode: true, encodeValuesOnly: true });
    const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('VNPAY - SIGNED DATA:');
    

    return secureHash === signed;
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
