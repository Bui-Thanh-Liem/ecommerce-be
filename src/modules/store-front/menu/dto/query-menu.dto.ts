import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class MenuFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}

export class MenuQueryDto extends createQueryDto(MenuFilterDto) {}
