import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFileDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  key: string;
}
