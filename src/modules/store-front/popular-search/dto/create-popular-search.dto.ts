import { Trim } from '@/decorators/trim.decorator';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePopularSearchDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  @MaxLength(100)
  text: string;
}
