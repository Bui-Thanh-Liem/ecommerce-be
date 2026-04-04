import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { LocationRegionType } from 'src/shared/enums/location-regions.enum';

export class CreateLocationRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(LocationRegionType)
  type: LocationRegionType;

  @IsOptional()
  @IsUUID()
  parent: string | undefined;
}
