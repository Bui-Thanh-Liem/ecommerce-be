import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export interface IOvResult {
  message?: string;
  statusCode?: number;
  metadata: any;
}

@Injectable()
export class OvInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OvInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    this.logger.debug('Before... -> controller ::: 0ms');
    return next.handle().pipe(
      tap(() => {
        this.logger.debug(`After::: ${Date.now() - now} ms`);
      }),
    );
  }
}
