import { Trim } from '@/decorators/trim.decorator';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @IsUUID('4')
  @IsNotEmpty()
  category: string;

  @IsUUID('4')
  @IsNotEmpty()
  brand: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsNumber()
  @IsNotEmpty()
  basePrice: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;
}
