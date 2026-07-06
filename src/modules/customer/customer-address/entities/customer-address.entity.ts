import { BaseEntity } from '@/shared/entities/base.entity';
import { ICustomerAddress } from '@/shared/interfaces/models/customer/customer-address.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { LocationRegionEntity } from '@/modules/inventory/location-regions/entities/location-region.entity';

@Entity('customer_addresses')
export class CustomerAddressEntity extends BaseEntity implements ICustomerAddress {
  @ManyToOne(() => CustomerEntity, (customer) => customer.addresses)
  customer: CustomerEntity;

  @ManyToOne(() => LocationRegionEntity, { nullable: false })
  country: LocationRegionEntity;

  @ManyToOne(() => LocationRegionEntity, { nullable: false })
  city: LocationRegionEntity;

  @ManyToOne(() => LocationRegionEntity, { nullable: false })
  district: LocationRegionEntity;

  @ManyToOne(() => LocationRegionEntity, { nullable: false })
  ward: LocationRegionEntity;

  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công CustomerAddress có recipientName: ${this.recipientName}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công CustomerAddress có recipientName: ${this.recipientName}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công CustomerAddress có recipientName: ${this.recipientName}`);
  }
}
