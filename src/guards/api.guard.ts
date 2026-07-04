import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApiGuard implements CanActivate {
  private readonly logger = new Logger(ApiGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // Cho phép truy cập mà không cần kiểm tra quyền
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;

    // Nếu không có API key, trả về lỗi Forbidden
    if (!apiKey) {
      this.logger.error('API key is missing in request headers');
      throw new ForbiddenException();
    }

    // Kiểm tra API key
    if (apiKey !== this.configService.get('API_KEY')) {
      this.logger.error('Invalid API key provided');
      throw new ForbiddenException();
    }

    return true;
  }
}
