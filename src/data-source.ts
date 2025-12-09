import 'reflect-metadata';
import { Permission } from 'src/modules/permission/entities/permission.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Token } from 'src/modules/tokens/entities/token.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'ecommerce',
  synchronize: true,
  logging: false,
  entities: [User, Token, Product, Role, Permission],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  subscribers: [],
});
