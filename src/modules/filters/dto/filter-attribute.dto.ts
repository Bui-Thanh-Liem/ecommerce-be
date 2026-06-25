import { IFilterAttribute } from '@/shared/dtos/res/filter-attribute.dto';
import { Expose, Type } from 'class-transformer';

class FilterAttributeOptionDto {
  @Expose()
  value: string;

  @Expose()
  desc: string;
}

export class FilterAttributeDto implements IFilterAttribute {
  @Expose()
  key: string;

  @Expose()
  label: string;

  @Expose()
  @Type(() => FilterAttributeOptionDto)
  options: FilterAttributeOptionDto[];
}
