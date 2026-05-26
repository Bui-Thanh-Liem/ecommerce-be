import { BaseEntity } from '@/shared/entities/base.entity';
import { IProductNavbar } from '@/shared/interfaces/models/navbar.interface';
import { Column, Entity } from 'typeorm';

@Entity('product_navbars')
export class ProductNavbarEntity extends BaseEntity implements IProductNavbar {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  desc: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 100 })
  link: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công ProductNavbar có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công ProductNavbar có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công ProductNavbar có name: ${this.name}`);
  }
}
