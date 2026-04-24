import { CustomerEntity } from '@/modules/customers/entities/customer.entity';
import { ProductVariantEntity } from '@/modules/product-variants-SKU/entities/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IRating } from '@/shared/interfaces/models/rating.inetrface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('ratings')
export class RatingEntity extends BaseEntity implements IRating {
  @ManyToOne(() => CustomerEntity, (customer) => customer.ratings)
  customer: CustomerEntity;

  @ManyToOne(() => ProductVariantEntity, (productVariant) => productVariant.ratings)
  productVariant: ProductVariantEntity;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string | undefined;

  @Column({ type: 'timestamp', nullable: true })
  timeUsed?: Date | undefined;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[] | undefined;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Rating có rating: ${this.rating}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Rating có rating: ${this.rating}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Rating có rating: ${this.rating}`);
  }
}
