import { VoucherDiscountType } from '@/shared/enums/voucher-discount-type.enum';
import { ICustomer } from './customer.interface';
import { IProductVariant } from './product-variant.interface';
import { IStore } from './store.interface';
import { IBase } from '../base.interface';
import { VoucherStatus } from '@/shared/enums/voucher-status.enum';
import { ICart } from './cart.interface';

export interface IVoucher extends IBase {
  code: string; // VD: SALE2026, FREESHIPHN
  discountValue: number;
  discountType: VoucherDiscountType; // percentage | fixed_amount | free_ship
  startDate: Date;
  title?: string; // Tên voucher, ví dụ: "Giảm 20% cho đơn hàng từ 500k"
  desc?: string; // Mô tả chi tiết về voucher
  endDate: Date;
  maxUses: number; // số lần tối đa được sử dụng cho voucher này, nếu là 0 thì không giới hạn
  usedCount: number; // số lần đã được sử dụng, sẽ tăng lên mỗi khi có đơn hàng áp dụng voucher này
  minOrderValue: number; // giá trị đơn tối thiểu
  store?: IStore; // Voucher chỉ áp dụng cho 1 cửa hàng (optional)
  applicableVariants?: IProductVariant[]; // Áp dụng cho sản phẩm cụ thể
  customer?: ICustomer; // Nếu là voucher cá nhân hóa
  status: VoucherStatus; // Trạng thái của voucher

  //
  carts?: ICart[]; // Một voucher có thể được áp dụng cho nhiều giỏ hàng (nếu nhiều khách hàng sử dụng voucher này)
}
