import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { LocationRegionEntity } from 'src/modules/location-regions/entities/location-region.entity';
import { PermissionEntity } from 'src/modules/permissions/entities/permission.entity';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { StaffTokenEntity } from 'src/modules/staff-tokens/entities/staff-token.entity';
import { StaffEntity } from 'src/modules/staffs/entities/staff.entity';
import { StoreEntity } from 'src/modules/stores/entities/store.entity';
import { DataSourceOptions } from 'typeorm';

//
const isProd = process.env.NODE_ENV === 'production';
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
  entities: [StaffEntity, RoleEntity, PermissionEntity, StaffTokenEntity, StoreEntity, LocationRegionEntity],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations-storage',
  poolSize: 10,
};

export default registerAs('postgres', (): TypeOrmModuleOptions => pgConfig);
