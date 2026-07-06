import { Injectable } from '@nestjs/common';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerAddressEntity } from './entities/customer-address.entity';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { LocationRegionsService } from '@/modules/inventory/location-regions/location-regions.service';

@Injectable()
export class CustomerAddressService {
  constructor(
    @InjectRepository(CustomerAddressEntity)
    private customerAddressRepo: Repository<CustomerAddressEntity>,
    private readonly customerService: CustomersService,
    private readonly locationRegionsService: LocationRegionsService
  ) {}

  async create(dto: CreateCustomerAddressDto) {
    const {} = dto; 
    
    const 
  }

  findAll() {
    return `This action returns all customerAddress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerAddress`;
  }

  update(id: number, dto: UpdateCustomerAddressDto) {
    return `This action updates a #${id} customerAddress`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerAddress`;
  }
}
