import { Reflector } from '@nestjs/core';

// Tạo decorator để gán permissions cho route handler
// Cách viết mới của setMetadata
export const Permissions = Reflector.createDecorator<string[]>();
