import { BaseEntity } from '@/shared/entities/base.entity';
import { ICategory } from '@/shared/interfaces/models/category.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends BaseEntity implements ICategory {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  desc?: string | null;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => CategoryEntity, (c) => c.children, { nullable: true })
  parent?: ICategory | null;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children?: ICategory[] | null;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Category có name: ${this.name}`);
  }
  logUpdate(): void {
    if (!this.name) this.slug = stringToSlug(this.name);
    this.logger.debug(`Đã cập nhật thành công Category có name: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Category có name: ${this.name}`);
  }
}
