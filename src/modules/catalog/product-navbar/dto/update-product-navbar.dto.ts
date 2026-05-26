import { PartialType } from '@nestjs/swagger';
import { CreateProductNavbarDto } from './create-product-navbar.dto';

export class UpdateProductNavbarDto extends PartialType(CreateProductNavbarDto) {}
