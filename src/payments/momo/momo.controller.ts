import { Controller, Post, Body, HttpCode, Get, Query, Res } from '@nestjs/common';
import { MoMoService } from './momo.service';
import { MoMoCreatePaymentDto, MoMoCreatePaymentResponseDto } from './dto/momo-create-payment.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import type { Response } from 'express';

@Controller('momo')
export class MoMoController {
  constructor(private readonly moMoService: MoMoService) {}

  @Post('create-payment')
  @Serializer(MoMoCreatePaymentResponseDto)
  create(@Body() createMoMoDto: MoMoCreatePaymentDto) {
    return this.moMoService.createPayment(createMoMoDto);
  }

  @Post('ipn')
  @HttpCode(204) // MoMo yêu cầu trả về 204 No Content
  async handleIPN(@Body() ipnData: any) {
    // Xử lý IPN từ MoMo tại đây
    await this.moMoService.handleIPN(ipnData);

    // Trả về empty body + status 204
    return {};
  }

  // Đường dẫn để MoMo redirect sau khi thanh toán (có thể là thành công hoặc hủy)
  @Get('momo')
  async redirectHandler(@Query() query: any, @Res() res: Response) {
    const { orderId, resultCode, message } = query;

    console.log('🔄 MoMo Redirect Received:', { orderId, resultCode, message });

    if (resultCode === '0') {
      // Thanh toán thành công
      // await this.moMoService.handleSuccess(orderId);
      return res.redirect(`/payment/success?orderId=${orderId}`);
    } else if (resultCode === '1' || resultCode === '4' || !resultCode) {
      // Khách hủy hoặc thất bại
      // await this.moMoService.handleCancelOrFail(orderId, message);
      return res.redirect(`/payment/failed?orderId=${orderId}&reason=${message || 'user_cancel'}`);
    }

    return res.redirect('/payment/failed');
  }
}
