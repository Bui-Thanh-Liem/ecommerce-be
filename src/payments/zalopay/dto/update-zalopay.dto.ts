import { PartialType } from '@nestjs/swagger';
import { CreateZalopayDto } from './create-zalopay.dto';

export class UpdateZalopayDto extends PartialType(CreateZalopayDto) {}
