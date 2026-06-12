import { ProductEntity } from '@/modules/catalog/products-SPU/entities/product.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { type IImage } from '@/shared/interfaces/common/image.interface';
import { IBrand } from '@/shared/interfaces/models/catalog/brand.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('brands')
export class BrandEntity extends BaseEntity implements IBrand {
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'json' })
  image: IImage;

  @Column({ type: 'varchar', length: 50 })
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
