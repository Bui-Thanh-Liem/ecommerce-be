import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;
}
