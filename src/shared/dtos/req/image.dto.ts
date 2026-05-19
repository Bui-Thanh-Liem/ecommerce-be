import { Provider } from '../../enums/provider.enum';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@/decorators/trim.decorator';

export class ImageDto {
  @IsNotEmpty()
  @Trim()
  @IsString()
  key: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  url: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  provider: Provider;
}
