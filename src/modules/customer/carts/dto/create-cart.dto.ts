import { IsOptional, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsUUID('4')
  customer: string;
}
