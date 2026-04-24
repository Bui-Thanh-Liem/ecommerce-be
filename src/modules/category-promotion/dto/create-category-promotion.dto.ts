import { IsInt, IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateCategoryPromotionDto {
  @IsUUID('4')
  @IsNotEmpty()
  category: string;

  @IsUUID('4')
  @IsNotEmpty()
  promotion: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  customDiscount: number;

  @IsInt()
  @Min(0)
  @Max(100)
  priority: number;
}
