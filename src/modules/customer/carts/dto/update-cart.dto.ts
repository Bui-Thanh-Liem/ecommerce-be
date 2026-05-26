import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { CartStatus } from '@/shared/enums/cart-status.enum';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  status: CartStatus;
}
