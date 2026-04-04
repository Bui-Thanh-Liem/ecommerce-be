import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationRegionDto } from './create-location-region.dto';

export class UpdateLocationRegionDto extends PartialType(
  CreateLocationRegionDto,
) {}
