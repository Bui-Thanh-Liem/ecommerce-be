import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  key: string;

  @IsOptional()
  expiresIn?: number; // Thời gian hết hạn của link (giây) - Mặc định 60 phút
}
