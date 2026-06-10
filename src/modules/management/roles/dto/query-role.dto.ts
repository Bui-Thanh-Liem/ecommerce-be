import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class RoleFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

export class RoleQueryDto extends createQueryDto(RoleFilterDto) {}
