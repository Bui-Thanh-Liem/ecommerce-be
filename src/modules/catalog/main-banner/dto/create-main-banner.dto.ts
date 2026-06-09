import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateMainBannerDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

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
}
