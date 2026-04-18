import { VoucherDiscountType } from '@/shared/enums/voucher-discount-type.enum';
import { ICustomer } from './customer.interface';
import { IProductVariant } from './product-variant.interface';
import { IStore } from './store.interface';

export interface IVoucher {
  code: string; // VD: SALE2026, FREESHIPHN
  discountValue: number;
  discountType: VoucherDiscountType; // percentage | fixed_amount | free_ship
  startDate: Date;
  endDate: Date;
  maxUses: number; // số lần tối đa được sử dụng cho voucher này, nếu là 0 thì không giới hạn
  usedCount: number; // số lần đã được sử dụng, sẽ tăng lên mỗi khi có đơn hàng áp dụng voucher này
  minOrderValue: number; // giá trị đơn tối thiểu
  store?: IStore; // Voucher chỉ áp dụng cho 1 cửa hàng (optional)
  applicableVariants?: IProductVariant[]; // Áp dụng cho sản phẩm cụ thể
  customer?: ICustomer; // Nếu là voucher cá nhân hóa
}
