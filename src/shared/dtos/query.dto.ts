import { IntersectionType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, Max } from 'class-validator';

class QueryBaseDto {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(100, { message: 'Limit number cannot be greater than 100' })
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (typeof value === 'string') {
      return JSON.parse(value) as Record<string, any>;
    } else if (typeof value === 'object') {
      return value;
    }
    return {};
  })
  filters?: Record<string, any>;
}

type Constructor<T = object> = new (...args: any[]) => T;

export function createQueryDto<T>(DtoClass: Constructor<T>) {
  return IntersectionType(QueryBaseDto, DtoClass) as Constructor<QueryBaseDto & T>;
}
