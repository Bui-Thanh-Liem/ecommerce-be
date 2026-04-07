import { ProductEntity } from '@/modules/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { IBrand } from '@/shared/interfaces/models/brand.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('brands')
export class BrandEntity extends BaseEntity implements IBrand {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 150 })
  code: string;

  @Column({ type: 'text' })
  logoUrl: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @OneToMany(() => ProductEntity, (product) => product.brand)
  products?: ProductEntity[] | undefined;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Brand có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Brand có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Brand có name: ${this.name}`);
  }
}
