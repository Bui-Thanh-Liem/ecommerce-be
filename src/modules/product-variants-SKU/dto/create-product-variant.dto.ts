import { Trim } from '@/decorators/trim.decorator';
import { CreateProductImageDto } from '@/modules/product-images/dto/create-product-image.dto';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class VariantAttributeDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  key: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  label: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  value: string;
}

export class CreateProductVariantDto {
  @IsUUID()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  discountPercent: number;

  @IsEnum(ProductVariantCondition)
  conditions: ProductVariantCondition;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => VariantAttributeDto)
  salesAttributes: VariantAttributeDto[];

  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  productImages: CreateProductImageDto[];
}
