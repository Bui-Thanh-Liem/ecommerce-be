import { Expose } from 'class-transformer';

export class BrandDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  logoUrl: string;

  @Expose()
  country: string;
}
