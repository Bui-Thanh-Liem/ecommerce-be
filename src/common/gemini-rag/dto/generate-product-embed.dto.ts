import { VariantAttributeDto } from '@/modules/catalog/product-variants-SKU/dto/create-product-variant.dto';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenerateProductEmbedDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @Type(() => VariantAttributeDto)
  salesAttributes: VariantAttributeDto[];
}
