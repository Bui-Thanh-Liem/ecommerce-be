import { ImageDto } from '@/shared/dtos/req/image.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;
}
