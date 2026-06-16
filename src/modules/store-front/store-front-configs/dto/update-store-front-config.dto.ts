import { PartialType } from '@nestjs/swagger';
import { CreateStoreFrontConfigDto } from './create-store-front-config.dto';

export class UpdateStoreFrontConfigDto extends PartialType(CreateStoreFrontConfigDto) {}
