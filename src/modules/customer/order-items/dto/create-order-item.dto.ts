import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID('4')
  product: string;

  @IsNumber()
  @Min(1, { message: 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1' })
  quantity: number;

  @IsNumber()
  @Min(1000, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 1000 VND' })
  price: number;
}
