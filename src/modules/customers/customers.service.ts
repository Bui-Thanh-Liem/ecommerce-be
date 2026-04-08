import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { phone } = createCustomerDto;

    // Kiểm tra xem đã tồn tại khách hàng với số điện thoại này chưa
    const existingCustomer = await this.customerRepo.exists({ where: { phone } });
    if (existingCustomer) {
      throw new Error('Customer with this phone number already exists');
    }

    // Tạo và lưu khách hàng mới
    const customer = this.customerRepo.create(createCustomerDto);
    return this.customerRepo.save(customer);
  }

  async findAll() {
    return this.customerRepo.find();
  }

  async findOne(id: string) {
    return this.customerRepo.findOne({ where: { id } });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { phone } = updateCustomerDto;

    // Kiểm tra xem khách hàng cần cập nhật có tồn tại không
    const existingCustomer = await this.customerRepo.exists({ where: { phone, id: Not(id) } });
    if (existingCustomer) {
      throw new Error('Another customer with this phone number already exists');
    }

    // Tải khách hàng cần cập nhật và cập nhật thông tin
    const customer = await this.customerRepo.preload({ id, ...updateCustomerDto });
    if (!customer) {
      throw new Error('Customer not found');
    }
    return this.customerRepo.save(customer);
  }

  async remove(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new Error('Customer not found');
    }
    return this.customerRepo.remove(customer);
  }
}
