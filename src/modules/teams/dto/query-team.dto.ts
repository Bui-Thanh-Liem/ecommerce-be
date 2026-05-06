import { createQueryDto } from '@/shared/dtos/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class TeamFilterDto {
  @IsOptional()
  @IsUUID()
  store?: string;
}

export class TeamQueryDto extends createQueryDto(TeamFilterDto) {}
