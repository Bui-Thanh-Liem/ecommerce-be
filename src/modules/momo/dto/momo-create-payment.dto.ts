import { Trim } from '@/decorators/trim.decorator';
import { MoMoPaymentCode } from '@/shared/enums/mono-payment-code.enum';
import { EMoMoRequestType } from '@/shared/enums/mono-request-type.enum';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class MoMoCreatePaymentDto {
  @IsNumber()
  @Min(1000, { message: 'Số tiền phải lớn hơn hoặc bằng 1000' })
  @Max(50000000, { message: 'Số tiền phải nhỏ hơn hoặc bằng 50,000,000' })
  amount: number;

  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'orderInfo không được để trống' })
  orderInfo: string;

  @IsOptional()
  @IsString()
  @Trim()
  orderId?: string;

  @IsOptional()
  @IsString()
  @Trim()
  extraData?: string;

  @IsEnum(EMoMoRequestType, {
    message: `requestType phải là một trong các giá trị sau: ${Object.values(EMoMoRequestType).join(', ')}`,
  })
  requestType: EMoMoRequestType;

  @IsEnum(MoMoPaymentCode, {
    message: `paymentCode phải là một trong các giá trị sau: ${Object.values(MoMoPaymentCode).join(', ')}`,
  })
  paymentCode: MoMoPaymentCode;
}

export class MoMoCreatePaymentResponseDto {
  @Expose()
  partnerCode: string;

  @Expose()
  requestId: string;

  @Expose()
  orderId: string;

  @Expose()
  amount: number;

  @Expose()
  responseTime: number;

  @Expose()
  message: string;

  @Expose()
  resultCode: 0;

  @Expose()
  payUrl: string;

  @Expose()
  shortLink: string;
}
