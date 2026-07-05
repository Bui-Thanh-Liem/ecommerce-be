import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

//
const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const host = process.env.POSTGRES_HOST || 'localhost';
const port = process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432;
const username = process.env.POSTGRES_USER || 'root';
const password = process.env.POSTGRES_PASSWORD || 'root';
const database = process.env.POSTGRES_DB || 'ecommerce';

if (!host || !port || !username || !password || !database) {
  throw new InternalServerErrorException(
    'Thiếu POSTGRES_HOST hoặc POSTGRES_PORT hoặc POSTGRES_USER hoặc POSTGRES_PASSWORD hoặc POSTGRES_DB',
  );
}

//
export const pgConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,
  synchronize: !isProd,
  migrationsRun: !isProd, // Tự động chạy migrations khi khởi động ứng dụng (chỉ nên dùng trong development)
  // logging: true,
  entities: [join(__dirname, '../**/**/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../**/*.migration{.ts,.js}')],
  migrationsTableName: 'migrations-storage',
  poolSize: 10,
};

export default registerAs('postgres', () => pgConfig);
