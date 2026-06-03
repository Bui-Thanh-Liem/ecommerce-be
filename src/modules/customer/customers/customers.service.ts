import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerTokensService } from '../customer-tokens/customer-tokens.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  private otp = '123456';

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    private customerTokensService: CustomerTokensService,
  ) {}

  async login(loginCustomerDto: LoginCustomerDto) {
    const { phone } = loginCustomerDto;

    //
    const existingCustomer = await this.customerRepo.exists({ where: { phone } });
    if (!existingCustomer) {
      const newCustomer = this.customerRepo.create({ phone, address: [], fullname: 'New Customer' });
      await this.customerRepo.save(newCustomer);
    }

    //
    try {
      // Gửi mã OTP qua SMS (giả lập)
      this.logger.debug(`Sending OTP code ${this.otp} to phone number ${phone}`);
      return { message: 'OTP code sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send OTP code to ${phone}: ${(error as Error)?.message}`);
      throw new BadRequestException('Send code failed');
    }
  }

  async verifyOtp(customer: CustomerEntity) {
    const { access } = await this.customerTokensService.updateAuthToken(customer.id);
    return { customer, token: access };
  }

  async validateCustomer(phone: string, otp: string) {
    //
    if (otp !== this.otp) throw new UnauthorizedException('Invalid OTP code');

    //
    const customer = await this.customerRepo.findOne({ where: { phone } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findAll() {
    return await this.customerRepo.find();
  }

  async findOne(id: string) {
    return await this.customerRepo.findOne({ where: { id } });
  }

  async exists(ids: string[]) {
    const count = await this.customerRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { phone } = updateCustomerDto;

    // Kiểm tra xem khách hàng cần cập nhật có tồn tại không
    const existingCustomer = await this.customerRepo.exists({ where: { phone, id: Not(id) } });
    if (existingCustomer) {
      throw new ConflictException('Another customer with this phone number already exists');
    }

    // Tải khách hàng cần cập nhật và cập nhật thông tin
    const customer = await this.customerRepo.preload({ id, ...updateCustomerDto });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return await this.customerRepo.save(customer);
  }

  async remove(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return await this.customerRepo.remove(customer);
  }
}
