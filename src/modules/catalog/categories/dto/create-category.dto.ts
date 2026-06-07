import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desc?: string;

  @IsOptional()
  @IsUUID('4')
  parent?: string;

  @IsOptional()
  @IsNumber()
  minPrice: number;
}
