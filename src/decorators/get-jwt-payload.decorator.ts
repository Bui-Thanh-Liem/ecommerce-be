import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetJwtPayload = createParamDecorator((data: any, ctx: ExecutionContext): IJwtPayload => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.payload!;
});
