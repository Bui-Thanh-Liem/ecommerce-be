import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desc?: string;

  @IsOptional()
  @IsUUID('4')
  parent?: string;
}
