import { Expose } from 'class-transformer';

export class ProductNavbarDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  slug: string;

  @Expose()
  link: string;
}
