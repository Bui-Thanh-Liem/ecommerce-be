import { Trim } from '@/decorators/trim.decorator';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { MarketingProgramStatus } from '@/shared/enums/marketing-program-status.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateMarketingProgramDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  desc?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  mainImage: ImageDto;

  @IsOptional()
  @IsEnum(MarketingProgramStatus)
  status?: MarketingProgramStatus;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  campaigns: string[];
}
