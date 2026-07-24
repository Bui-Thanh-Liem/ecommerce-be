import { Controller, Post, Res, Req, HttpCode, Body } from '@nestjs/common';
import { SepayService } from './sepay.service';
import { Public } from '@/decorators/public.decorator';
import { type Request, type Response } from 'express';
import { type IWebhookEvent } from './sepay.interface';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Public()
  @Post('checkout')
  createCheckout(@Body() body: CreateCheckoutDto) {
    return this.sepayService.createCheckout(body);
  }

  // @Public()
  // @Post('ipn')
  // ipn(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() payload: IWebhookEvent) {
  //   this.sepayService.ipn(req, res, payload);
  //   return res.status(200).json({ success: true, message: 'IPN received' });
  // }

  @Public()
  @HttpCode(200)
  @Post('payment')
  handleWebhookEvent(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() payload: IWebhookEvent) {
    const signature = (req.headers['x-sepay-signature'] || '') as string;
    const timestamp = (req.headers['x-sepay-timestamp'] || '') as string;

    //
    this.sepayService.verifyWebhookSignature({
      res,
      payload,
      timestamp,
      signature,
    });

    //
    const result = this.sepayService.handleWebhookEvent(payload);
    return { success: result };
  }
}
