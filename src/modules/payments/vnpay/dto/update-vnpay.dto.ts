import { PartialType } from '@nestjs/swagger';
import { CreateVnPayDto } from './create-vnpay.dto';

export class UpdateVnPayDto extends PartialType(CreateVnPayDto) {}
