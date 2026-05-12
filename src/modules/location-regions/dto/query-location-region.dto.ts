import { createQueryDto } from '@/shared/dtos/query.dto';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class LocationRegionFilterDto {
  @IsOptional()
  @IsString()
  parent: string;

  @IsOptional()
  @IsEnum(LocationRegionType)
  type: LocationRegionType;
}

export class LocationRegionQueryDto extends createQueryDto(LocationRegionFilterDto) {}
