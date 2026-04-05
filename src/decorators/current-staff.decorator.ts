import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// không dùng để lưu trữ metadata mà dùng để xử lý dữ liệu từ Request và đưa nó vào tham số của Controller.
export const CurrentStaff = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.staff;
});
