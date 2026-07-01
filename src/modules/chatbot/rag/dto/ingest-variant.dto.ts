import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VariantAttributeDto } from '@/modules/catalog/product-variants-SKU/dto/create-product-variant.dto';

class BaseDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;
}

class BrandDto extends BaseDto {
  @IsString()
  name: string;
}

class CategoryDto extends BaseDto {
  @IsString()
  name: string;
}

class ProductDto extends BaseDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @ValidateNested()
  @Type(() => BrandDto)
  brand: BrandDto;
}

export class IngestVariantDto extends BaseDto {
  @IsString()
  sku: string;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  salesAttributes: VariantAttributeDto[];

  @ValidateNested()
  @Type(() => ProductDto)
  product: ProductDto;
}
