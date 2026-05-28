import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { PromotionApplyScope } from '@/shared/enums/promotion-apply-scope.enum';
import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePromotionDto {
  @IsUUID('4')
  @IsNotEmpty()
  campaign: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(PromotionApplyType)
  applyType: PromotionApplyType;

  @IsEnum(PromotionApplyScope)
  applyScope: PromotionApplyScope;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productHighlighted: string[];

  @IsNumber()
  @Min(0)
  limitQuantity: number;

  @IsNumber()
  @Min(0)
  totalSoldQuantity: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  stores: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  locations: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productPromotions: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  categoryPromotions: string[];
}
