import { Trim } from '@/decorators/trim.decorator';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateRatingDto {
  @IsUUID('4')
  @IsNotEmpty()
  customer: string;

  @IsUUID('4')
  @IsNotEmpty()
  productVariant: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
