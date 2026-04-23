import { PartialType } from '@nestjs/swagger';
import { CreateNavbarDto } from './create-navbar.dto';

export class UpdateNavbarDto extends PartialType(CreateNavbarDto) {}
