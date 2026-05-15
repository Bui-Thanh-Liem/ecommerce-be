import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  // ... có thể thêm các trường khác như sortOrder, isThumbnail nếu cần thiết
}
