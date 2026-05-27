import { Trim } from '@/decorators/trim.decorator';
import { CreateProductImageDto } from '@/modules/catalog/product-images/dto/create-product-image.dto';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { ISpecification } from '@/shared/interfaces/models/product.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class SpecificationItemDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  key: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  value: string;

  @IsOptional()
  @IsBoolean()
  isHighlight?: boolean;

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

export class CreateProductDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
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

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(20)
  model: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsBoolean()
  isFeatured: boolean;

  @IsBoolean()
  allowReview: boolean;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];

  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  productImages: CreateProductImageDto[];
}
