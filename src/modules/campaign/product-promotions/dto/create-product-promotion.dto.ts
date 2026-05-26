import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateProductPromotionDto {
  @IsUUID('4')
  @IsNotEmpty()
  productVariant: string;

  @IsUUID('4')
  @IsNotEmpty()
  promotion: string;

  @IsOptional()
  @IsNumber()
  @Max(100)
  @Min(0)
  customDiscount: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  priority: number;
}
