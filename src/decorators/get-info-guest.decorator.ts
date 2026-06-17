import { IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { ILocationSelection } from '@/shared/interfaces/common/location-selection.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetInfoGuest = createParamDecorator((data: any, ctx: ExecutionContext): IInfoGuest => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const session = (request.cookies['e_session'] || '') as string;
  const personal = (request.cookies['e_personal'] || '') as string;
  const jsonString = decodeURIComponent(personal) || '{}';
  const personalObj = JSON.parse(jsonString) as ILocationSelection;
  return { session, personal: personalObj };
});
