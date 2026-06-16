import { BaseEntity } from '@/shared/entities/base.entity';
import {
  type IConfigHome,
  IStoreFrontConfig,
} from '@/shared/interfaces/models/store-front/store-front-config.interface';
import { Column, Entity } from 'typeorm';

@Entity('store_front_configs')
export class StoreFrontConfigEntity extends BaseEntity implements IStoreFrontConfig {
  @Column({ type: 'json' })
  homeConfig: IConfigHome;

  logInsert(): void {
    this.logger.debug('Đã chèn thành công StoreFrontConfig');
  }
  logUpdate(): void {
    this.logger.debug('Đã cập nhật thành công StoreFrontConfig');
  }
  logRemove(): void {
    this.logger.debug('Đã xóa thành công StoreFrontConfig');
  }
}
