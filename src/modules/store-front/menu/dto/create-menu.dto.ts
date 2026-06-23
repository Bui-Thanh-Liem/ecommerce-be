import { Trim } from '@/decorators/trim.decorator';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMenuDto {
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

  @IsNotEmpty()
  @IsUUID('4')
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
