import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

//
const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

//
export const pgConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
  username: process.env.POSTGRES_USER || 'root',
  password: process.env.POSTGRES_PASSWORD || 'root',
  database: process.env.POSTGRES_DB || 'ecommerce',
  synchronize: !isProd,
  migrationsRun: !isProd, // Tự động chạy migrations khi khởi động ứng dụng (chỉ nên dùng trong development)
  // logging: true,
  entities: [join(__dirname, '../**/**/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../**/*.migration{.ts,.js}')],
  migrationsTableName: 'migrations-storage',
  poolSize: 10,
};

export default registerAs('postgres', () => pgConfig);
