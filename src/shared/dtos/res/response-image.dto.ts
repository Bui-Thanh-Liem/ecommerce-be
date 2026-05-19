import { Expose } from 'class-transformer';
import { Provider } from '../../enums/provider.enum';

export class ResponseImageDto {
  @Expose()
  key: string;

  @Expose()
  url: string;

  @Expose()
  provider: Provider;
}
