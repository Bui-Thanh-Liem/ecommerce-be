import { Type } from 'class-transformer';

export class QueryDto {
  @Type(() => Number)
  page?: number;

  @Type(() => Number)
  limit?: number;
}
