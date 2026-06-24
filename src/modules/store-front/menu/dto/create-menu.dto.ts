import { Trim } from '@/decorators/trim.decorator';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsUUID('4')
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
