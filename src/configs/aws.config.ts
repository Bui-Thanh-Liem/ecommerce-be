import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const s3ClientConfig = new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default registerAs('s3-client', (): S3Client => s3ClientConfig);
