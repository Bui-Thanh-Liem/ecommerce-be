// enums/permission.enum.ts
export enum EPermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  CANCEL = 'cancel',
  REFUND = 'refund',
}

// enums/resource.enum.ts
export enum EPermissionResource {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  ORDERS = 'orders',
  CUSTOMERS = 'customers',
  INVENTORY = 'inventory',
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  PROMOTIONS = 'promotions',
  REVIEWS = 'reviews',
}

// enums/role.enum.ts
export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  SALES_STAFF = 'SALES_STAFF',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  MARKETING_MANAGER = 'MARKETING_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  CUSTOMER = 'CUSTOMER',
}
