import { BaseEntity } from '@/shared/entities/base.entity';
import { IPopularSearch } from '@/shared/interfaces/models/store-front/popular-search.interface';
import { Column, Entity } from 'typeorm';

@Entity('popular_searches')
export class PopularSearchEntity extends BaseEntity implements IPopularSearch {
  @Column({ length: 100 })
  text: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công PopularSearch có text: ${this.text}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công PopularSearch có text: ${this.text}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công PopularSearch có text: ${this.text}`);
  }
}
