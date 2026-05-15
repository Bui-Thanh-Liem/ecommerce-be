import { Trim } from '@/decorators/trim.decorator';
import { CreateProductImageDto } from '@/modules/product-images/dto/create-product-image.dto';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  productImages: CreateProductImageDto[];
}
