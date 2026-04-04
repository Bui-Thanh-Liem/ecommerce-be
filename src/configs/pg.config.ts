import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { StaffEntity } from 'src/modules/staffs/entities/staff.entity';
import { LocationRegionEntity } from 'src/modules/location-regions/entities/location-region.entity';
import { StoreEntity } from 'src/modules/stores/entities/store.entity';

//
const isProd = process.env.NODE_ENV === 'prod';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

//
export const pgConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
  username: process.env.POSTGRES_USER || 'root',
  password: process.env.POSTGRES_PASSWORD || 'root',
  database: process.env.POSTGRES_DB || 'ecommerce',
  synchronize: !isProd,
  // logging: true,
  entities: [StaffEntity, StoreEntity, LocationRegionEntity],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations-storage',
  poolSize: 10,
};

export default registerAs('postgres', (): TypeOrmModuleOptions => pgConfig);
