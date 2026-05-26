import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProductNavbarDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  desc: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  link: string;
}
