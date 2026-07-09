import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(query: CustomerAddressQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const [data, totalData] = await this.customerAddressRepo.findAndCount({
      relations: ['customer', 'country', 'provinceCity', 'districtTown', 'wardCommune'],
      select: {
        id: true,
        address: true,
        createdAt: true,
        isDefault: true,
        customer: { id: true, fullname: true, phone: true },
        country: { id: true, name: true },
        provinceCity: { id: true, name: true },
        districtTown: { id: true, name: true },
        wardCommune: { id: true, name: true },
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

  async findOneIsDefault(customerId: string) {
    return await this.customerAddressRepo.findOne({
      where: { customer: { id: customerId }, isDefault: true },
      relations: ['customer', 'country', 'provinceCity', 'districtTown', 'wardCommune'],
      select: {
        id: true,
        address: true,
        createdAt: true,
        isDefault: true,
        recipientName: true,
        recipientPhone: true,
        customer: { id: true, fullname: true, phone: true },
        country: { id: true, name: true },
        provinceCity: { id: true, name: true },
        districtTown: { id: true, name: true },
        wardCommune: { id: true, name: true },
      },
    });
  }

  async create(id: string, dto: CreateCustomerAddressDto) {
    const { provinceCity, country, districtTown, wardCommune, ...rest } = dto;

    //
    const [customerExist, isFirstAddress, locationExists] = await Promise.all([
      this.customerService.exists([id]),
      this.customerAddressRepo.count(),
      this.locationRegionsService.exists([provinceCity, country, districtTown, wardCommune]),
    ]);

    //
    if (!customerExist) throw new NotFoundException('Customer not found');
    if (!locationExists) {
      throw new NotFoundException('One or more location regions do not exist');
    }

    //
    const dataCreate = this.customerAddressRepo.create({
      ...rest,
      customer: { id: id },
      address: dto.address,
      country: { id: country },
      wardCommune: { id: wardCommune },
      provinceCity: { id: provinceCity },
      districtTown: { id: districtTown },
      isDefault: isFirstAddress === 0 ? true : dto.isDefault,
    });
    return this.customerAddressRepo.save(dataCreate);
  }

  async findAllOwned(customerId: string, query: CustomerAddressQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const [data, totalData] = await this.customerAddressRepo.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'country', 'provinceCity', 'districtTown', 'wardCommune'],
      select: {
        id: true,
        address: true,
        createdAt: true,
        isDefault: true,
        recipientName: true,
        recipientPhone: true,
        customer: { id: true, fullname: true, phone: true },
        country: { id: true, name: true },
        provinceCity: { id: true, name: true },
        districtTown: { id: true, name: true },
        wardCommune: { id: true, name: true },
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

  async updateOwned(id: string, customerId: string, dto: UpdateCustomerAddressDto) {
    const { provinceCity, country, districtTown, wardCommune, isDefault, ...restDto } = dto;

    //
    const [customerExist, existWard, existProvince, existCountry, existDistrict] = await Promise.all([
      this.customerService.exists([customerId]),
      wardCommune ? this.locationRegionsService.exists([wardCommune]) : null,
      provinceCity ? this.locationRegionsService.exists([provinceCity]) : null,
      country ? this.locationRegionsService.exists([country]) : null,
      districtTown ? this.locationRegionsService.exists([districtTown]) : null,
    ]);

    //
    if (!customerExist) throw new NotFoundException('Customer not found');
    if (
      (wardCommune && !existWard) ||
      (provinceCity && !existProvince) ||
      (country && !existCountry) ||
      (districtTown && !existDistrict)
    ) {
      throw new NotFoundException('One or more location regions do not exist');
    }

    //
    if (isDefault) {
      // Nếu isDefault = true, thì set tất cả các địa chỉ khác của customer này về isDefault = false
      await this.customerAddressRepo.update({ customer: { id: customerId }, isDefault: true }, { isDefault: false });
    }

    //
    const dataUpdate = await this.customerAddressRepo.preload({
      id,
      ...restDto,
      isDefault,
      customer: { id: customerId },
      country: country ? { id: country } : undefined,
      provinceCity: provinceCity ? { id: provinceCity } : undefined,
      districtTown: districtTown ? { id: districtTown } : undefined,
      wardCommune: wardCommune ? { id: wardCommune } : undefined,
    });

    if (!dataUpdate) {
      throw new NotFoundException('CustomerAddress not found');
    }

    return await this.customerAddressRepo.save(dataUpdate);
  }

  async removeOwned(id: string, customerId: string) {
    const customerAddress = await this.customerAddressRepo.findOne({ where: { id, customer: { id: customerId } } });

    if (!customerAddress) {
      throw new NotFoundException('CustomerAddress not found');
    }

    if (customerAddress.isDefault) {
      throw new BadRequestException('Cannot delete default address');
    }

    return await this.customerAddressRepo.remove(customerAddress);
  }
}
