import { BaseMetadataDto } from '@/shared/dtos/res/base-metadata.dto';
import { Expose, Type } from 'class-transformer';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { MenuDto } from './menu.dto';

export class MenuMetadataDto extends BaseMetadataDto implements IMetadata<MenuDto> {
  @Expose()
  @Type(() => MenuDto)
  data: MenuDto[];
}
