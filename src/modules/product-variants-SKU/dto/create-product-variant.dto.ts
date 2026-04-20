import { Trim } from '@/decorators/trim.decorator';
import { ProductVariantCondition } from '@/shared/enums/product-variant-condition.enum';
import { ISpecification } from '@/shared/interfaces/models/product-variant.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Entity } from 'typeorm';

class SpecificationItemDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  key: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  value: string;

  @IsNotEmpty()
  @IsNumber()
  priority: number;

  @IsOptional()
  @IsBoolean()
  isHighlight?: boolean;

  @IsOptional()
  @IsString()
  @Trim()
  link?: string;

  @IsNotEmpty()
  @IsBoolean()
  isSKU: boolean;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

class SpecificationDto implements ISpecification {
  @IsNotEmpty()
  @IsString()
  @Trim()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({ type: [SpecificationItemDto] })
  @Type(() => SpecificationItemDto)
  items: [SpecificationItemDto];
}

@Entity('product_variants')
export class CreateProductVariantDto {
  @IsUUID()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  discountPrice: number;

  @IsNumber()
  @IsNotEmpty()
  discountPercent: number;

  @IsEnum(ProductVariantCondition)
  conditions: ProductVariantCondition;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];
}
