import { Trim } from '@/decorators/trim.decorator';
import { LocationRegionType } from '@/shared/enums/location-region-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLocationRegionDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ type: String, default: '7 District' })
  name: string;

  @IsEnum(LocationRegionType, { message: 'type must be a valid LocationRegionType' })
  @ApiProperty({ enum: LocationRegionType, default: LocationRegionType.PROVINCE_CITY })
  type: LocationRegionType;

  @IsOptional()
  @IsUUID()
  parent: string | undefined;
}
