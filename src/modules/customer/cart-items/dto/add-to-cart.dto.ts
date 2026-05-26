import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID('4')
  @IsNotEmpty()
  cart: string;

  @IsUUID('4')
  @IsNotEmpty()
  product: string;

  @IsUUID('4')
  @IsNotEmpty()
  productVariant: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  discount: number;
}
