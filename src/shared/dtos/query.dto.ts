import { Type } from 'class-transformer';
import { IsOptional, Max } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(100, { message: 'Limit number cannot be greater than 100' })
  limit: number = 10;
}
