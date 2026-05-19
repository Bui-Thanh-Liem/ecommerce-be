import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  key: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  contentType: string;

  @IsOptional()
  expiresIn?: number; // Thời gian hết hạn của link (giây) - Mặc định 5 phút
}
