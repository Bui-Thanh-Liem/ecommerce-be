import { createQueryDto } from '@/shared/dtos/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class StaffFilterDto {
  @IsOptional()
  @IsUUID()
  store?: string;
}

export class StaffQueryDto extends createQueryDto(StaffFilterDto) {}
