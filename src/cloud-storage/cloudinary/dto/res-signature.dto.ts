import { Expose } from 'class-transformer';

export class ResSignature {
  @Expose()
  folder: string;

  @Expose()
  signature: string;

  @Expose()
  timestamp: number;

  @Expose()
  api_key: string;

  @Expose()
  cloud_name: string;
}
