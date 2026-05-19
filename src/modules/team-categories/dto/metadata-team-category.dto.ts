import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { TeamCategoryDto } from './team-category.dto';

export class TeamCategoryMetadataDto extends BaseMetadataDto implements IMetadata<TeamCategoryDto> {
  @Expose()
  @Type(() => TeamCategoryDto)
  data: TeamCategoryDto[];
}
