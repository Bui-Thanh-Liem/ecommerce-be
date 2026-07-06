import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerAddressEntity } from './entities/customer-address.entity';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { LocationRegionsService } from '@/modules/inventory/location-regions/location-regions.service';
import { CustomerAddressQueryDto } from './dto/query-customer-address.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class CustomerAddressService {
  constructor(
    @InjectRepository(CustomerAddressEntity)
    private customerAddressRepo: Repository<CustomerAddressEntity>,
    private readonly customerService: CustomersService,
    private readonly locationRegionsService: LocationRegionsService,
  ) {}

  async create(dto: CreateCustomerAddressDto) {
    const { customer, city, country, district, ward } = dto;

    //
    const [customerExist, locationExists] = await Promise.all([
      this.customerService.exists([customer]),
      this.locationRegionsService.exists([city, country, district, ward]),
    ]);

    //
    if (!customerExist) throw new NotFoundException('Customer not found');
    if (!locationExists) {
      throw new NotFoundException('One or more location regions do not exist');
    }

    //
    const dataCreate = this.customerAddressRepo.create({
      customer: { id: customer },
      country: { id: country },
      city: { id: city },
      district: { id: district },
      ward: { id: ward },
      address: dto.address,
    });
    return this.customerAddressRepo.save(dataCreate);
  }

  async findAll(query: CustomerAddressQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const [data, totalData] = await this.customerAddressRepo.findAndCount({
      relations: ['customer', 'country', 'city', 'district', 'ward'],
      select: {
        id: true,
        address: true,
        isDefault: true,
        customer: { id: true, fullname: true, phone: true },
        country: { id: true, name: true },
        city: { id: true, name: true },
        district: { id: true, name: true },
        ward: { id: true, name: true },
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findAllOwned(customerId: string, query: CustomerAddressQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const [data, totalData] = await this.customerAddressRepo.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'country', 'city', 'district', 'ward'],
      select: {
        id: true,
        address: true,
        isDefault: true,
        customer: { id: true, fullname: true, phone: true },
        country: { id: true, name: true },
        city: { id: true, name: true },
        district: { id: true, name: true },
        ward: { id: true, name: true },
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async update(id: string, dto: UpdateCustomerAddressDto) {
    const { customer, city, country, district, ward } = dto;

    //
    const [customerExist, ...rest] = await Promise.all([
      customer ? this.customerService.exists([customer]) : null,
      ward ? this.locationRegionsService.exists([ward]) : null,
      city ? this.locationRegionsService.exists([city]) : null,
      country ? this.locationRegionsService.exists([country]) : null,
      district ? this.locationRegionsService.exists([district]) : null,
    ]);

    //
    if (!customerExist) throw new NotFoundException('Customer not found');
    if (!rest.every((exists) => exists)) {
      throw new NotFoundException('One or more location regions do not exist');
    }

    //
    const dataUpdate = await this.customerAddressRepo.preload({
      id,
      customer: customer ? { id: customer } : undefined,
      country: country ? { id: country } : undefined,
      city: city ? { id: city } : undefined,
      district: district ? { id: district } : undefined,
      ward: ward ? { id: ward } : undefined,
      address: dto.address,
    });

    if (!dataUpdate) {
      throw new NotFoundException('CustomerAddress not found');
    }

    return await this.customerAddressRepo.save(dataUpdate);
  }

  async remove(id: string) {
    const customerAddress = await this.customerAddressRepo.findOne({ where: { id } });
    if (!customerAddress) {
      throw new NotFoundException('CustomerAddress not found');
    }
    return await this.customerAddressRepo.remove(customerAddress);
  }
}
