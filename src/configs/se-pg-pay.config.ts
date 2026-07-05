import { InternalServerErrorException } from '@nestjs/common';
import { SePayPgClient } from 'sepay-pg-node';
import dotenv from 'dotenv';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const env = process.env.SEPAY_ENV || 'sandbox';
const merchantId = process.env.SEPAY_MERCHANT_ID || '';
const ipnSecret = process.env.SEPAY_IPN_SECRET_KEY || '';

if (!merchantId || !ipnSecret) {
  throw new InternalServerErrorException('Thiếu SEPAY_MERCHANT_ID hoặc SEPAY_IPN_SECRET_KEY');
}

if (!['sandbox', 'production'].includes(env || '')) {
  throw new InternalServerErrorException('SEPAY_ENV phải là "sandbox" hoặc "production"');
}

export const sepayClient = new SePayPgClient({
  env: env as 'sandbox' | 'production',
  merchant_id: merchantId,
  secret_key: ipnSecret,
});
