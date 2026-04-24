import { Expose } from 'class-transformer';

export class NavbarDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  link: string;
}
