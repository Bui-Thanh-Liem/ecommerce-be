import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export interface IOvResult {
  message?: string;
  statusCode?: number;
  metadata: any;
}

@Injectable()
export class OvInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    console.log('Before... -> controller ::: 0ms');
    return next.handle().pipe(
      tap(() => {
        console.log(`After::: ${Date.now() - now} ms`);
      }),
    );
  }
}
