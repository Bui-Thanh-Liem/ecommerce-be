import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { IResponseCheckout, IWebhookEvent } from './interface/sepay.interface';
import { sepayClient } from '@/configs/se-pg-pay.config';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrdersService } from '@/modules/customer/orders/orders.service';
import { OrderStatus } from '@/shared/enums/order-status.enum';

@Injectable()
export class SepayService {
  constructor(
    private readonly configService: ConfigService,
    private orderService: OrdersService,
  ) {}

  async createCheckout(payload: CreateCheckoutDto): Promise<IResponseCheckout> {
    const { amount, description, paymentMethod, order: orderId } = payload;

    //
    const orderExists = await this.orderService.exists([orderId]);
    if (!orderExists) throw new InternalServerErrorException('Order not found');

    //
    const invoiceNumber = `INV-${Date.now()}`;
    const checkoutURL = sepayClient.checkout.initCheckoutUrl();
    const APP_BASE_URL = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3001';
    console.log('APP_BASE_URL:', APP_BASE_URL);

    const fields = {
      merchant: 'SP-TEST-BT674A37',
      order_amount: '12000',
      currency: 'VND',
      operation: 'PURCHASE',
      // order_description: 'Thanh toán đơn hàng #6f440124-16b4-45f7-959e-6a45d7511ea9',
      order_description: 'Thanh toan don hang #6f440124-16b4-45f7-959e-6a45d7511ea9',
      order_invoice_number: 'INV-1784886968673',
      payment_method: 'BANK_TRANSFER',
      success_url: 'https://8982-42-112-75-109.ngrok-free.app/payment/success',
      error_url: 'https://8982-42-112-75-109.ngrok-free.app/payment/error',
      cancel_url: 'https://8982-42-112-75-109.ngrok-free.app/payment/cancel',
    };

    // Tự ký
    const allowed = [
      'order_amount',
      'merchant',
      'currency',
      'operation',
      'order_description',
      'order_invoice_number',
      'payment_method',
      'success_url',
      'error_url',
      'cancel_url',
    ];

    const signString = allowed.map((key) => `${key}=${fields[key as keyof typeof fields]}`).join(',');

    const signature = crypto.createHmac('sha256', process.env.SEPAY_SECRET_KEY!).update(signString).digest('base64');

    console.log('Manual Signature:', signature);

    const checkoutFormFields = { ...fields, signature } as any;

    //
    // const checkoutFormFields = sepayClient.checkout.initOneTimePaymentFields({
    //   operation: 'PURCHASE',
    //   payment_method: paymentMethod,
    //   order_invoice_number: invoiceNumber,
    //   order_amount: amount,
    //   currency: 'VND',
    //   order_description: description,
    //   success_url: `${APP_BASE_URL}/payment/success`,
    //   error_url: `${APP_BASE_URL}/payment/error`,
    //   cancel_url: `${APP_BASE_URL}/payment/cancel`,
    // });

    console.log('=== CHECKOUT FIELDS ===');
    console.dir(checkoutFormFields, { depth: null });

    console.log('Signature generated:', checkoutFormFields.signature);

    const debugFields = checkoutFormFields; // hoặc object bạn truyền vào

    const allowedFields = [
      'order_amount',
      'merchant',
      'currency',
      'operation',
      'order_description',
      'order_invoice_number',
      'payment_method',
      'success_url',
      'error_url',
      'cancel_url',
    ];

    console.log('🔍 SIGNING STRING:', signString);
    console.log('🔑 SECRET KEY LENGTH:', process.env.SEPAY_SECRET_KEY?.length);

    // chuyển trạng thái pendding, để đối chiếu trong ipn sau
    await this.orderService.changeStatus(orderId, OrderStatus.PENDING);

    return { checkoutURL, checkoutFormFields };
  }

  // ipn(req: Request, res: Response, payload: any) {
  //   try {
  //     // 1. Xác thực bằng X-Secret-Key (chỉ có khi cấu hình IPN auth type = SECRET_KEY)
  //     const receivedKey = req.header('X-Secret-Key');
  //     const expectedKey = this.configService.get<string>('SEPAY_IPN_SECRET_KEY');

  //     if (!expectedKey || receivedKey !== expectedKey) {
  //       console.warn('[ipn] Unauthorized IPN call, key mismatch');
  //       return res.status(401).json({ success: false, message: 'Unauthorized' });
  //     }

  //     const { notification_type, order, transaction } = payload;

  //     if (!order || !order.order_invoice_number) {
  //       return res.status(400).json({ success: false, message: 'Missing order data' });
  //     }

  //     const existingOrder = orderStore.findByInvoiceNumber(order.order_invoice_number);
  //     if (!existingOrder) {
  //       // Không tìm thấy đơn hàng tương ứng trong hệ thống -> log để soát lại,
  //       // nhưng vẫn trả 200 để SePay không retry vô ích (đây không phải lỗi từ SePay).
  //       console.warn('[ipn] Không tìm thấy order:', order.order_invoice_number);
  //       return res.status(200).json({ success: true });
  //     }

  //     // 2. Idempotency: nếu đơn đã paid rồi thì bỏ qua, tránh xử lý trùng do retry
  //     if (existingOrder.status === 'paid') {
  //       return res.status(200).json({ success: true });
  //     }

  //     // 3. Đối chiếu số tiền để chắc chắn không bị giả mạo/đổi giá
  //     const notifiedAmount = Number(order.order_amount);
  //     if (notifiedAmount !== Number(existingOrder.amount)) {
  //       console.error('[ipn] Số tiền không khớp!', {
  //         expected: existingOrder.amount,
  //         received: notifiedAmount,
  //       });
  //       return res.status(200).json({ success: true }); // vẫn ack để tránh retry, nhưng KHÔNG set paid
  //     }

  //     if (notification_type === 'ORDER_PAID' && order.order_status === 'CAPTURED') {
  //       orderStore.markPaid(order.order_invoice_number, {
  //         sepayOrderId: order.id,
  //         transactionId: transaction && transaction.transaction_id,
  //       });
  //       // TODO: kích hoạt logic nghiệp vụ của bạn ở đây, ví dụ:
  //       // - gửi email/thông báo cho khách
  //       // - kích hoạt khoá học / gói dịch vụ / đơn hàng
  //     } else if (notification_type === 'TRANSACTION_VOID') {
  //       orderStore.markStatus(order.order_invoice_number, 'voided');
  //     }

  //     // Luôn trả 200 + JSON để SePay ghi nhận đã nhận thành công
  //     return res.status(200).json({ success: true });
  //   } catch (err) {
  //     console.error('[ipn] error:', err);
  //     // Trả lỗi 500 để SePay retry lại (theo lịch Fibonacci) trong trường hợp lỗi hệ thống thật sự
  //     return res.status(500).json({ success: false, message: 'Internal error' });
  //   }
  // }

  handleWebhookEvent(event: IWebhookEvent) {
    console.log('Received webhook event:', event);
    return true;
  }

  verifyWebhookSignature(params: { res: Response; signature: string; timestamp: string; payload: IWebhookEvent }) {
    const { res, signature, timestamp, payload } = params;

    //
    const secret = this.configService.get<string>('SEPAY_WEBHOOK_SECRET');
    if (!secret) throw new InternalServerErrorException('SEPAY_WEBHOOK_SECRET is not defined');

    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(timestamp + '.' + JSON.stringify(payload))
        .digest('hex');

    if (signature !== expected) {
      return res.status(401).send('Invalid signature');
    }
  }
}
