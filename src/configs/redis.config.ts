import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  tls?: object;
}

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379,
};

export default registerAs('redis', (): RedisOptions => redisConfig);
