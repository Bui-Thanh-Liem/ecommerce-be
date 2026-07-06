import { SetMetadata } from '@nestjs/common';

// Tên khóa metadata để đánh dấu route là customer
export const IS_CUSTOMER_KEY = 'isCustomer';
export const Customer = () => SetMetadata(IS_CUSTOMER_KEY, true);
