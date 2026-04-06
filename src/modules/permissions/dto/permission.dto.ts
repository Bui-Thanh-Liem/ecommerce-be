import { Expose } from 'class-transformer';

export class PermissionDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  desc: string;

  @Expose()
  code: string;

  @Expose()
  isActive: boolean;
}
