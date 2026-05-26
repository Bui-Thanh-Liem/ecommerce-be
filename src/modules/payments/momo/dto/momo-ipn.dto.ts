import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MoMoIPNDto {
  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'partnerCode không được để trống' })
  partnerCode: string;

  @IsNotEmpty({ message: 'orderId không được để trống' })
  @IsString()
  @Trim()
  orderId: string;

  @IsNotEmpty({ message: 'requestId không được để trống' })
  @IsString()
  @Trim()
  requestId: string;

  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'amount không được để trống' })
  amount: string; // MoMo trả về dạng string

  @IsString()
  @Trim()
  @IsOptional()
  orderType?: string; // momo_wallet, m2m, etc.

  @IsString()
  @Trim()
  @IsOptional()
  transId?: string;

  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'resultCode không được để trống' })
  resultCode: string; // Quan trọng: dạng string

  @IsString()
  @Trim()
  @IsOptional()
  message?: string;

  @IsString()
  @Trim()
  @IsOptional()
  payType?: string;

  @IsString()
  @Trim()
  @IsOptional()
  responseTime?: string;

  @IsString()
  @Trim()
  @IsOptional()
  extraData?: string;

  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'signature không được để trống' })
  signature: string;

  @IsString()
  @Trim()
  @IsOptional()
  errorCode?: string;

  @IsString()
  @Trim()
  @IsOptional()
  refundTransId?: string;

  @IsString()
  @Trim()
  @IsOptional()
  refundAmount?: string;
}
