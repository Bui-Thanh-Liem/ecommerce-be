import { BaseEntity } from '@/shared/entities/base.entity';
import { INavbar } from '@/shared/interfaces/models/navbar.interface';
import { Column, Entity } from 'typeorm';

@Entity('navbars')
export class NavbarEntity extends BaseEntity implements INavbar {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 100 })
  slug: string;

  @Column({ type: 'text' })
  link: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Navbar có name: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Navbar có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Navbar có name: ${this.name}`);
  }
}
