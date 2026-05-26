import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(255)
  desc: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ImageDto)
  mainImage: ImageDto;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ImageDto)
  @MaxLength(5)
  images: ImageDto[];

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  promotions: string[];
}
