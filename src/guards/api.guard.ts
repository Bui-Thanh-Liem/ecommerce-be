import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApiGuard implements CanActivate {
  logger = new Logger(ApiGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest<Request>();
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // Cho phép truy cập mà không cần kiểm tra quyền
    if (isPublic) {
      return true;
    }

    // Nếu không có API key, trả về lỗi Forbidden
    console.log('ApiGuard - API key from header::', apiKey);
    if (!apiKey) {
      throw new ForbiddenException('API key is required');
    }

    // Kiểm tra API key
    if (apiKey !== this.configService.get('API_KEY')) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
