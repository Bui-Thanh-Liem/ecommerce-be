import { BaseMetadataDto } from '@/shared/dtos/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { TeamDto } from './team.dto';

export class TeamMetadataDto extends BaseMetadataDto implements IMetadata<TeamDto> {
  @Expose()
  @Type(() => TeamDto)
  data: TeamDto[];
}
