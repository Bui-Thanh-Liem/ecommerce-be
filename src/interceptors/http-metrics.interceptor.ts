import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../common/metrics/metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method } = req;

    // Dùng route pattern thay vì req.url để tránh cardinality explosion
    // VD: /users/123 → /users/:id
    const route = (req.route?.path ?? req.url) as string;

    const endTimer = this.metricsService.httpRequestDuration.startTimer({
      method,
      route,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const statusCode = String(res.statusCode);

          endTimer({ status_code: statusCode });
          this.metricsService.httpRequestTotal.inc({ method, route, status_code: statusCode });

          if (res.statusCode >= 400) {
            this.metricsService.httpRequestErrors.inc({ method, route, status_code: statusCode });
          }
        },
        error: (err) => {
          const statusCode = String(err?.statusCode ?? 500);
          endTimer({ status_code: statusCode });
          this.metricsService.httpRequestTotal.inc({ method, route, status_code: statusCode });
          this.metricsService.httpRequestErrors.inc({ method, route, status_code: statusCode });
        },
      }),
    );
  }
}
