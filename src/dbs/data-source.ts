import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'ecommerce',
  synchronize: false,
  logging: true,
  entities: ['dist/src/modules/**/entities/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations',
  subscribers: [],
});
