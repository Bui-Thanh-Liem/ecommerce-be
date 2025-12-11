import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

interface Response {
  message: string;
  statusCode?: number;
  metadata: any;
}

@Injectable()
export class OvInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    console.log('Before::: 0 ms');

    return next.handle().pipe(
      tap(() => {
        console.log(`After::: ${Date.now() - startTime} ms`);
      }),
      map((res: Response) => {
        return {
          message: res.message || 'Success',
          statusCode: res.statusCode || 200,
          metadata: res.metadata,
        };
      }),
    );
  }
}
