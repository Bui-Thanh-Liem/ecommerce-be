import { PartialType } from '@nestjs/swagger';
import { CreateMainBannerDto } from './create-main-banner.dto';

export class UpdateMainBannerDto extends PartialType(CreateMainBannerDto) {}
