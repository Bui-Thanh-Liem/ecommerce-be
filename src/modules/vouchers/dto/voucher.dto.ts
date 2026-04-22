import { CustomerDto } from '@/modules/customers/dto/customer.dto';
import { ProductVariantSKUDto } from '@/modules/product-variants-SKU/dto/product-variant-SKU.dto';
import { StoreDto } from '@/modules/stores/dto/store.dto';
import { VoucherDiscountType } from '@/shared/enums/voucher-discount-type.enum';
import { VoucherStatus } from '@/shared/enums/voucher-status.enum';
import { Expose, Type } from 'class-transformer';

export class VoucherDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  discountValue: number;

  @Expose()
  discountType: VoucherDiscountType;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  maxUses: number;

  @Expose()
  usedCount: number;

  @Expose()
  minOrderValue: number;

  @Expose()
  status: VoucherStatus;

  @Expose()
  store?: StoreDto;

  @Expose()
  @Type(() => ProductVariantSKUDto)
  applicableVariants?: ProductVariantSKUDto[] | null;

  @Expose()
  customer?: CustomerDto | null;
}
