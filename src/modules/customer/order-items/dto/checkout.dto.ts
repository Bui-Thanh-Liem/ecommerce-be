import { IsArray, ValidateNested } from 'class-validator';
import { ChangeQuantityDto } from '../../orders/dto/change-quantity-item.dto';

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  items: ChangeQuantityDto[];
}
