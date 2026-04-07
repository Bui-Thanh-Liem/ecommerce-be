import { Trim } from '@/decorators/trim.decorator';
import { ProductItemStatus } from '@/shared/enums/product-item-status.enum';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProductItemDto {
  @IsNotEmpty()
  @IsUUID('4')
  productVariant: string;

  @IsNotEmpty()
  @IsUUID('4')
  inventory: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  serialNumber: string;

  @IsNotEmpty()
  @IsEnum(ProductItemStatus)
  status: ProductItemStatus;
}
