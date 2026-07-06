import { Module } from '@nestjs/common';
import { CustomerAddressService } from './customer-address.service';
import { CustomerAddressController } from './customer-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAddressEntity } from './entities/customer-address.entity';
import { CustomersModule } from '../customers/customers.module';
import { LocationRegionsModule } from '@/modules/inventory/location-regions/location-regions.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerAddressEntity]), CustomersModule, LocationRegionsModule],
  controllers: [CustomerAddressController],
  providers: [CustomerAddressService],
  exports: [CustomerAddressService],
})
export class CustomerAddressModule {}
