import { Expose } from 'class-transformer';

export class BaseMetadataDto {
  @Expose()
  totalData: number;

  @Expose()
  page: number;

  @Expose()
  totalPage: number;
}
