import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { Not, Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VoucherEntity)
    private voucherRepo: Repository<VoucherEntity>,

    private readonly customersService: CustomersService,
    private readonly storesService: StoresService,
    private readonly variantsService: ProductVariantsService,
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const {
      store: storeId,
      customer: customerId,
      applicableVariants: applicableVariantIds,
      code,
      ...rest
    } = createVoucherDto;
    // Kiểm tra trùng code
    const existingVoucher = await this.voucherRepo.exists({ where: { code } });
    if (existingVoucher) {
      throw new NotFoundException('Voucher with this code already exists');
    }

    // Kiểm tra nếu voucher có liên kết với khách hàng cụ thể
    if (customerId) {
      const customer = await this.customersService.exists([customerId]);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    // Kiểm tra nếu voucher có liên kết với cửa hàng cụ thể
    if (storeId) {
      const store = await this.storesService.exists([storeId]);
      if (!store) {
        throw new NotFoundException('Store not found');
      }
    }

    // Kiểm tra nếu voucher áp dụng cho các biến thể sản phẩm cụ thể
    if (applicableVariantIds && applicableVariantIds.length > 0) {
      const variantsExist = await this.variantsService.exists(applicableVariantIds);
      if (!variantsExist) {
        throw new NotFoundException('One or more product variants not found');
      }
    }

    // Tạo và lưu voucher mới
    const voucher = this.voucherRepo.create({
      ...rest,
      code,
      store: storeId ? { id: storeId } : undefined,
      customer: customerId ? { id: customerId } : undefined,
      applicableVariants: applicableVariantIds ? applicableVariantIds.map((id) => ({ id })) : [],
    });
    return await this.voucherRepo.save(voucher);
  }

  async findAll() {
    return await this.voucherRepo.find({ relations: ['store', 'customer', 'applicableVariants'] });
  }

  async findOne(id: string) {
    const voucher = await this.voucherRepo.findOne({
      where: { id },
      relations: ['store', 'customer', 'applicableVariants'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto) {
    const {
      code,
      store: storeId,
      customer: customerId,
      applicableVariants: applicableVariantIds,
      ...rest
    } = updateVoucherDto;

    // 1. Preload: Tìm voucher cũ và merge với data mới
    const voucher = await this.voucherRepo.preload({
      id,
      ...rest,
      code,
      // Xử lý quan hệ ID
      ...(storeId && { store: { id: storeId } }),
      ...(customerId && { customer: { id: customerId } }),
      ...(applicableVariantIds && { applicableVariants: applicableVariantIds.map((id) => ({ id })) }),
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    // 2. Kiểm tra trùng Slug mới (nếu tên thay đổi)
    if (code) {
      const existingVoucher = await this.voucherRepo.findOne({
        where: { code, id: Not(id) },
      });
      if (existingVoucher) throw new ConflictException('New voucher code results in a duplicate');
    }

    // 3. Lưu lại (Lúc này các Subscriber/Hooks như logUpdate của bạn mới chạy)
    return await this.voucherRepo.save(voucher);
  }

  async remove(id: string) {
    const voucher = await this.findOne(id);
    return await this.voucherRepo.remove(voucher);
  }
}
