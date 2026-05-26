import { Trim } from '@/decorators/trim.decorator';
import { VoucherDiscountType } from '@/shared/enums/voucher-discount-type.enum';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  code: string; // VD: SALE2026, FREESHIPHN

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsEnum(VoucherDiscountType)
  discountType: VoucherDiscountType; // percentage | fixed_amount | free_ship

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxUses: number; // số lần tối đa được sử dụng cho voucher này, nếu là 0 thì không giới hạn

  @IsNumber()
  @Min(0)
  minOrderValue: number; // giá trị đơn tối thiểu

  @IsUUID('4')
  @IsOptional()
  store?: string; // Voucher chỉ áp dụng cho 1 cửa hàng (optional)

  @IsOptional()
  @IsUUID('4', { each: true })
  applicableVariants?: string[]; // Áp dụng cho sản phẩm cụ thể

  @IsUUID('4')
  @IsOptional()
  customer?: string; // Nếu là voucher cá nhân hóa
}
