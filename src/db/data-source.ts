import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || '',
  port: process.env.MYSQL_PORT ? +process.env.MYSQL_PORT : 3306,
  username: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB || '',
  synchronize: false,
  logging: true,
  entities: ['dist/src/modules/**/entities/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations-storage',
  poolSize: 10,
  connectorPackage: 'mysql2',
  timezone: '+07:00', // Việt Nam
  charset: 'utf8mb4_unicode_ci',
});
