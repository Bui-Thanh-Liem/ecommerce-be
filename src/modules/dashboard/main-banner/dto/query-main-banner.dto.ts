import { createQueryDto } from '@/shared/dtos/req/query.dto';

class MainBannerFilterDto {}

export class MainBannerQueryDto extends createQueryDto(MainBannerFilterDto) {}
