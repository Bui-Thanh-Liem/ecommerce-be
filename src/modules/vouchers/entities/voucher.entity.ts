import { CustomerEntity } from '@/modules/customers/entities/customer.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { StoreEntity } from '@/modules/stores/entities/store.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { VoucherDiscountType } from '@/shared/enums/voucher-discount-type.enum';
import { IVoucher } from '@/shared/interfaces/models/voucher.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('vouchers')
export class VoucherEntity extends BaseEntity implements IVoucher {
  @Column({ unique: true })
  code: string; // VD: SALE2026, FREESHIPHN

  @Column('decimal')
  discountValue: number;

  @Column({ type: 'enum', enum: VoucherDiscountType }) // percentage | fixed_amount | free_ship
  discountType: VoucherDiscountType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: 0 })
  maxUses: number; // số lần tối đa được sử dụng cho voucher này, nếu là 0 thì không giới hạn

  @Column({ default: 0 })
  usedCount: number; // số lần đã được sử dụng, sẽ tăng lên mỗi khi có đơn hàng áp dụng voucher này

  @Column({ default: null })
  minOrderValue: number; // giá trị đơn tối thiểu

  @ManyToOne(() => StoreEntity, (store) => store.vouchers, { nullable: true })
  store: StoreEntity; // Voucher chỉ áp dụng cho 1 cửa hàng (optional)

  @ManyToMany(() => ProductVariantEntity)
  @JoinTable({ name: 'voucher_product_variants' }) // Bảng trung gian
  applicableVariants: ProductVariantEntity[]; // Áp dụng cho sản phẩm cụ thể

  @ManyToOne(() => CustomerEntity, { nullable: true }) // Nếu là voucher cá nhân hóa
  customer: CustomerEntity;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Voucher có code: ${this.code}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Voucher có code: ${this.code}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Voucher có code: ${this.code}`);
  }
}
