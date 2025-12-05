import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    console.log('Before :::', startTime);

    return next.handle().pipe(
      tap(() => {
        console.log('After :::', Date.now());
      }),
      map((data) => {
        return {
          message: 'Success',
          data: data,
        };
      }),
    );
  }
}
