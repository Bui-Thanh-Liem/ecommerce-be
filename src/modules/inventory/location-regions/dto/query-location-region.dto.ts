import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

class LocationRegionFilterDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid parent UUID format for id' })
  parent: string;

  @IsOptional()
  @IsEnum(LocationRegionType)
  type: LocationRegionType;
}

export class LocationRegionQueryDto extends createQueryDto(LocationRegionFilterDto) {}
