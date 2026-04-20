import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { MoMoCreatePaymentDto, MoMoCreatePaymentResponseDto } from './dto/momo-create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { EMoMoRequestType } from '@/shared/enums/mono-request-type.enum';
import { MoMoPaymentCode } from '@/shared/enums/mono-payment-code.enum';

@Injectable()
export class MoMoService {
  private readonly logger = new Logger(MoMoService.name);

  //
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;

  //
  private readonly endpoint: string; // Production: https://payment.momo.vn
  private readonly redirectUrl: string; // URL khách hàng sẽ được chuyển đến sau khi thanh toán
  private readonly ipnUrl: string; // URL nhận IPN từ MoMo

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Load cấu hình từ environment variables
    this.endpoint = this.configService.get<string>('MOMO_ENDPOINT') || '';
    this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY') || '';
    this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || '';
    this.redirectUrl = this.configService.get<string>('MOMO_RETURN_URL') || '';
    this.ipnUrl = this.configService.get<string>('MOMO_NOTIFY_URL') || '';
    this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE') || '';

    // Kiểm tra nếu thiếu config nào đó thì log lỗi
    if (!this.endpoint || !this.accessKey || !this.secretKey || !this.partnerCode) {
      this.logger.error('Missing MoMo configuration. Please check environment variables.');
    }
  }

  /**
   * Tạo đơn hàng thanh toán MoMo
   */
  async createPayment(data: MoMoCreatePaymentDto) {
    const { amount, orderInfo, extraData = '', requestType, paymentCode, orderId = `MOMO${Date.now()}` } = data;

    const requestId = orderId;

    // ==================== TẠO SIGNATURE ====================
    // eslint-disable-next-line max-len
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    // ==================== BODY REQUEST ====================
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang: 'vi',
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
      ...this.createPaymentCode(requestType, paymentCode),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = response.data as MoMoCreatePaymentResponseDto;

      if (result.resultCode !== 0) {
        throw new BadRequestException(result.message);
      }

      return result;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message =
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion
        (error as any)?.response?.data?.message || (error as Error)?.message || 'Error creating MoMo payment';
      this.logger.error('MoMo Create Payment Error:', message);
      throw new BadRequestException(message);
    }
  }

  private createPaymentCode(requestType: EMoMoRequestType, paymentCode: MoMoPaymentCode) {
    if (requestType === EMoMoRequestType.PAY_WITH_METHOD) return { requestType, paymentCode };
    return { requestType };
  }

  /**
   * Xác thực chữ ký IPN từ MoMo
   */
  private verifyIPNSignature(data: any): boolean {
    const { signature, ...rawData } = data;

    // Sắp xếp key theo thứ tự a-z (MoMo yêu cầu)
    const sortedKeys = Object.keys(rawData).sort();
    const rawSignature = sortedKeys.map((key) => `${key}=${rawData[key]}`).join('&');

    const computedSignature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    return computedSignature === signature;
  }

  /**
   * Xử lý IPN Callback từ MoMo
   */
  async handleIPN(ipnData: any): Promise<{ resultCode: number; message: string }> {
    this.logger.debug('📨 MoMo IPN Received:', ipnData);

    // 1. Kiểm tra chữ ký
    if (!this.verifyIPNSignature(ipnData)) {
      this.logger.error('❌ IPN Signature Invalid');
      return { resultCode: 1, message: 'Invalid signature' };
    }

    // 2. Kiểm tra resultCode
    if (ipnData.resultCode !== 0) {
      this.logger.warn(`⚠️ Payment failed: ${ipnData.message}`);
      // TODO: Cập nhật trạng thái đơn hàng = FAILED
      return { resultCode: 0, message: 'Payment failed recorded' };
    }

    // 3. Xử lý thành công
    const { orderId, transId, amount, extraData } = ipnData;

    this.logger.debug(`✅ Payment SUCCESS - Order: ${orderId}, TransId: ${transId}, Amount: ${amount}`);

    // TODO: Cập nhật database
    // await this.orderService.updateOrderStatus(orderId, 'PAID', transId);

    return { resultCode: 0, message: 'Success' };
  }
}
