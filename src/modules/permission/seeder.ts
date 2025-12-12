import { Permission } from './entities/permission.entity';

export const SEED_PERMISSIONS: {
  [key: string]: Pick<Permission, 'code' | 'name' | 'description'>;
} = {
  user_create: { code: '1', name: 'user:create', description: 'Create users' },
  user_read: { code: '2', name: 'user:read', description: 'Read users' },
  user_update: { code: '3', name: 'user:update', description: 'Update users' },
  user_delete: { code: '4', name: 'user:delete', description: 'Delete users' },

  role_create: { code: '5', name: 'role:create', description: 'Create roles' },
  role_read: { code: '6', name: 'role:read', description: 'Read roles' },
  role_update: { code: '7', name: 'role:update', description: 'Update roles' },
  role_delete: { code: '8', name: 'role:delete', description: 'Delete roles' },

  product_create: {
    code: '9',
    name: 'product:create',
    description: 'Create products',
  },
  product_read: {
    code: '10',
    name: 'product:read',
    description: 'Read products',
  },
  product_update: {
    code: '11',
    name: 'product:update',
    description: 'Update products',
  },
  product_delete: {
    code: '12',
    name: 'product:delete',
    description: 'Delete products',
  },

  order_create: {
    code: '13',
    name: 'order:create',
    description: 'Create orders',
  },
  order_read: { code: '14', name: 'order:read', description: 'Read orders' },
  order_update: {
    code: '15',
    name: 'order:update',
    description: 'Update orders',
  },
  order_delete: {
    code: '16',
    name: 'order:delete',
    description: 'Delete orders',
  },

  inventory_create: {
    code: '17',
    name: 'inventory:create',
    description: 'Create inventory',
  },
  inventory_read: {
    code: '18',
    name: 'inventory:read',
    description: 'Read inventory',
  },
  inventory_update: {
    code: '19',
    name: 'inventory:update',
    description: 'Update inventory',
  },
  inventory_delete: {
    code: '20',
    name: 'inventory:delete',
    description: 'Delete inventory',
  },
};
