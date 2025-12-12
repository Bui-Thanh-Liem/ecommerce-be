import { SetMetadata } from '@nestjs/common';

// Tên khóa metadata để đánh dấu route là public
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
