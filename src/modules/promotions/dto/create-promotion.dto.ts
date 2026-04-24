import { Trim } from '@/decorators/trim.decorator';
import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  imageUrl: string;

  @IsEnum(PromotionApplyType)
  @IsNotEmpty()
  applyType: PromotionApplyType;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsUUID('4', { each: true })
  productHighlighted: string[];

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  maxUsagePerUser: number;

  @IsUUID('4')
  @IsNotEmpty()
  campaign: string;
}
