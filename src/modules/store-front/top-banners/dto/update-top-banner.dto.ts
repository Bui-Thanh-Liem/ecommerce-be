import { PartialType } from '@nestjs/swagger';
import { CreateTopBannerDto } from './create-top-banner.dto';

export class UpdateTopBannerDto extends PartialType(CreateTopBannerDto) {}
