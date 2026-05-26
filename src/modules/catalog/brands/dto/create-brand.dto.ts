import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  country: string;
}
