import { Exclude, Expose } from 'class-transformer';

export class AuthDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;
}
