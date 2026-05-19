import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignatureDto {
  @IsNotEmpty({ message: 'Folder is required.' })
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Folder is required.' })
  @MaxLength(50, { message: 'Folder must be at most 50 characters.' })
  folder: string;
}
