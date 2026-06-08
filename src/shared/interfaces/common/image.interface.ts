import { Provider } from '../../enums/provider.enum';

export interface IImage {
  key: string;
  url: string;
  provider: Provider;
}
