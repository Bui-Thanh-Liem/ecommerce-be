import { Trim } from '@/decorators/trim.decorator';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(255)
  desc: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  mainImageUrl: string;

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  imageUrls: string[];

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  promotions: string[];
}
