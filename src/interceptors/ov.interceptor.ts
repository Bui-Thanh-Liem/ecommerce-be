import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { finalize, Observable } from 'rxjs';

@Injectable()
export class OvInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OvInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startAt = Date.now();
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();
    const method = req?.method ?? 'UNKNOWN';
    const url = req?.originalUrl ?? req?.url ?? 'UNKNOWN';

    this.logger.debug(`req.start method=${method} url=${url}`);

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - startAt;
        const statusCode = res?.statusCode ?? 500;
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
        const message = `req.done method=${method} url=${url} status=${statusCode} duration_ms=${durationMs}`;

        this.logger[level](message);
      }),
    );
  }
}
