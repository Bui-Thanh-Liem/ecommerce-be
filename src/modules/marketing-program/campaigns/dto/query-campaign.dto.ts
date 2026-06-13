import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { IsOptional, IsUUID } from 'class-validator';

class CampaignFilterDto {
  @IsOptional()
  @IsUUID('4')
  marketingProgram?: string;
}

export class CampaignQueryDto extends createQueryDto(CampaignFilterDto) {}
