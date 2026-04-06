import { Logger } from '@nestjs/common';
import { Exclude } from 'class-transformer';

export class SerializerDto {
  @Exclude()
  logger: Logger;
}
