import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateMainBannerDto {
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
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsUUID('4')
  campaign: string;
}
