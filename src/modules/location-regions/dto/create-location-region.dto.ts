import { Trim } from '@/decorators/trim.decorator';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLocationRegionDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEnum(LocationRegionType, { message: 'type must be a valid LocationRegionType' })
  type: LocationRegionType;

  @IsOptional()
  @IsUUID()
  parent: string | undefined;
}
