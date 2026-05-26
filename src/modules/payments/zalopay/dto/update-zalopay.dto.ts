import { PartialType } from '@nestjs/swagger';
import { CreateZaloPayDto } from './create-zalopay.dto';

export class UpdateZaloPayDto extends PartialType(CreateZaloPayDto) {}
