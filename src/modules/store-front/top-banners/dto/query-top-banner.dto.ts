import { createQueryDto } from '@/shared/dtos/req/query.dto';

class TopBannerFilterDto {}

export class TopBannerQueryDto extends createQueryDto(TopBannerFilterDto) {}
