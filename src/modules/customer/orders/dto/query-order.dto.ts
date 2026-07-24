import { createQueryDto } from '@/shared/dtos/req/query.dto';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

class OrderFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;
}

export class OrderQueryDto extends createQueryDto(OrderFilterDto) {}
