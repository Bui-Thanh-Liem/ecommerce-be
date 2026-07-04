import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSepayDto } from './dto/create-sepay.dto';
import { UpdateSepayDto } from './dto/update-sepay.dto';
import { Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { WebhookEvent } from './event.interface';

@Injectable()
export class SepayService {
  constructor(private readonly configService: ConfigService) {}

  create(createSepayDto: CreateSepayDto) {
    return 'This action adds a new sepay';
  }

  findAll() {
    return `This action returns all sepay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sepay`;
  }

  update(id: number, updateSepayDto: UpdateSepayDto) {
    return `This action updates a #${id} sepay`;
  }

  remove(id: number) {
    return `This action removes a #${id} sepay`;
  }

  handleWebhookEvent(event: WebhookEvent) {
    console.log('Received webhook event:', event);
    return true;
  }

  verifyWebhookSignature(params: { res: Response; signature: string; timestamp: string; payload: WebhookEvent }) {
    const { res, signature, timestamp, payload } = params;

    const secret = this.configService.get<string>('SEPAY_SECRET');
    if (!secret) throw new InternalServerErrorException('SEPAY_SECRET is not defined in the environment variables');

    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(timestamp + '.' + JSON.stringify(payload))
        .digest('hex');

    console.log('expected signature:', expected);
    console.log('received signature:', signature);

    if (signature !== expected) {
      return res.status(401).send('Invalid signature');
    }
  }
}

/**
 * Chữ ký	X-SePay-Signature: sha256=<hex>
 * Timestamp	X-SePay-Timestamp: <unix_seconds>
 * Chuỗi ký	{timestamp}.{raw_body}
 * Thuật toán	HMAC-SHA256
 */
