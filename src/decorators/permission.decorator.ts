import { SetMetadata } from '@nestjs/common';

// Tạo decorator để gán permissions cho route handler
export const IS_PERMISSION_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(IS_PERMISSION_KEY, permissions);
