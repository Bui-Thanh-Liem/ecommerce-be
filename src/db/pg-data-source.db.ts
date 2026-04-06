import { pgConfig } from '@/configs/pg.config';
import { DataSource } from 'typeorm';

//
export const connectionPostgresDataSource = new DataSource(pgConfig);
