import { BaseEntity } from '@/shared/entities/base.entity';
import { ICustomerAddress } from '@/shared/interfaces/models/customer/customer-address.interface';
import { Column, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { LocationRegionEntity } from '@/modules/inventory/location-regions/entities/location-region.entity';

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

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  logInsert(): void {
    throw new Error('Method not implemented.');
  }
  logUpdate(): void {
    throw new Error('Method not implemented.');
  }
  logRemove(): void {
    throw new Error('Method not implemented.');
  }
}
