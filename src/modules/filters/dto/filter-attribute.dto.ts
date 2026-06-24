import { IFilterAttribute } from '@/shared/dtos/res/filter-attribute.dto';
import { Expose } from 'class-transformer';

export class FilterAttributeDto implements IFilterAttribute {
  @Expose()
  key: string;

  @Expose()
  label: string;

  @Expose()
  values: string[];
}
