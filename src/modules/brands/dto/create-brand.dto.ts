import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  logoUrl: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  country: string;
}
