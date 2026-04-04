import { pgConfig } from 'src/configs/pg.config';
import { DataSource } from 'typeorm';

//
export const connectionPostgresDataSource = new DataSource(pgConfig);
