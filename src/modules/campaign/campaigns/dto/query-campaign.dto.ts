import { createQueryDto } from '@/shared/dtos/req/query.dto';

class CampaignFilterDto {}

export class CampaignQueryDto extends createQueryDto(CampaignFilterDto) {}
