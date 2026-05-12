import { createQueryDto } from '@/shared/dtos/query.dto';
import { IsOptional, IsString } from 'class-validator';

class TeamFilterDto {
  @IsOptional()
  @IsString()
  store: string;
}

export class TeamQueryDto extends createQueryDto(TeamFilterDto) {}
