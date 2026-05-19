import { Type, Transform, plainToInstance } from 'class-transformer';
import { ValidateNested, IsOptional, Max } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueryBaseDto<T> {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(100, { message: 'Limit number cannot be greater than 100' })
  limit: number = 10;
}

type Constructor<T = object> = new (...args: any[]) => T;

export function createQueryDto<T>(FilterDto: Constructor<T>) {
  class QueryDto extends QueryBaseDto<T> {
    @IsOptional()
    @Transform(({ value }) => {
      if (typeof value === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(value);
        return plainToInstance(FilterDto, parsed);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return plainToInstance(FilterDto, value);
    })
    @ValidateNested()
    @Type(() => FilterDto)
    filters?: T;
  }

  return QueryDto;
}
