import { PartialType } from '@nestjs/swagger';
import { CreateSepayDto } from './create-sepay.dto';

export class UpdateSepayDto extends PartialType(CreateSepayDto) {}
