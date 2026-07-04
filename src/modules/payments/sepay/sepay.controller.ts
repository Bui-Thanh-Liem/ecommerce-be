import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { SepayService } from './sepay.service';
import { CreateSepayDto } from './dto/create-sepay.dto';
import { UpdateSepayDto } from './dto/update-sepay.dto';
import { Public } from '@/decorators/public.decorator';
import { type Request, type Response } from 'express';
import { WebhookEvent } from './event.interface';

@Controller('sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Post()
  create(@Body() createSepayDto: CreateSepayDto) {
    return this.sepayService.create(createSepayDto);
  }

  @Get()
  findAll() {
    return this.sepayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sepayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSepayDto: UpdateSepayDto) {
    return this.sepayService.update(+id, updateSepayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sepayService.remove(+id);
  }

  @Public()
  @Post('sepay-payment')
  handleWebhookEvent(@Res() res: Response, @Req() req: Request) {
    const signature = (req.headers['x-sepay-signature'] || '') as string;
    const timestamp = (req.headers['x-sepay-timestamp'] || '') as string;
    const payload = req.body as WebhookEvent;

    //
    this.sepayService.verifyWebhookSignature({
      res,
      payload,
      timestamp,
      signature,
    });

    //
    return this.sepayService.handleWebhookEvent(payload);
  }
}
