import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379;
const redisPassword = process.env.REDIS_PASSWORD;
const redisTls = process.env.REDIS_TLS === 'true' ? {} : undefined;

if (!redisHost || !redisPort || (!redisPassword && process.env.REDIS_PASSWORD !== undefined)) {
  throw new Error('Thiếu REDIS_HOST hoặc REDIS_PORT hoặc REDIS_PASSWORD');
}

export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  tls?: object;
}

const redisConfig: RedisOptions = {
  host: redisHost,
  tls: redisTls,
  port: redisPort,
  password: redisPassword,
};

export default registerAs('redis', (): RedisOptions => redisConfig);
