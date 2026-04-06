import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { LocationRegionType } from '@/shared/enums/location-regions.enum';

export class CreateLocationRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(LocationRegionType, { message: 'type must be a valid LocationRegionType' })
  type: LocationRegionType;

  @IsOptional()
  @IsUUID()
  parent: string | undefined;
}
