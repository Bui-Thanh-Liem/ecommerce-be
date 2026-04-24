import { CustomerProductType } from '@/shared/enums/customer-product-type.enum';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCustomerProductDto {
  @IsUUID('4')
  @IsNotEmpty()
  customer: string;

  @IsUUID('4')
  @IsNotEmpty()
  productVariant: string;

  @IsEnum(CustomerProductType)
  type: CustomerProductType;
}
