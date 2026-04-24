import { CustomerEntity } from '@/modules/customers/entities/customer.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';
import { ICustomerProduct } from '@/shared/interfaces/models/customer-product.interface';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity('customer_products')
@Index(['customer', 'productVariant', 'type'], { unique: true })
export class CustomerProductEntity extends BaseEntity implements ICustomerProduct {
  @Column({ type: 'enum', enum: CustomerProductType })
  type: CustomerProductType;

  @ManyToOne(() => CustomerEntity, { nullable: false })
  customer: CustomerEntity;

  @ManyToOne(() => ProductVariantEntity, { nullable: false })
  productVariant: ProductVariantEntity;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Customer có fullname: ${this.customer.fullname}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Customer có fullname: ${this.customer.fullname}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Customer có fullname: ${this.customer.fullname}`);
  }
}
