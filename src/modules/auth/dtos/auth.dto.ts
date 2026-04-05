import { Exclude, Expose } from 'class-transformer';

export class AuthDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  fullName: string;

  @Expose()
  store: string;

  @Expose()
  isActive: boolean;

  @Expose()
  isAdmin: boolean;

  @Expose()
  admin: boolean;

  @Exclude()
  password: string;
}
