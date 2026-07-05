import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const region = process.env.AWS_REGION || '';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';

if (!region || !accessKeyId || !secretAccessKey) {
  throw new InternalServerErrorException('Thiếu AWS_REGION hoặc AWS_ACCESS_KEY_ID hoặc AWS_SECRET_ACCESS_KEY ');
}

const s3ClientConfig = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export default registerAs('s3-client', (): S3Client => s3ClientConfig);
