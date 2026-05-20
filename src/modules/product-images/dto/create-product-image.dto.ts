import { ImageDto } from '@/shared/dtos/req/image.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductImageDto extends PartialType(ImageDto) {}
