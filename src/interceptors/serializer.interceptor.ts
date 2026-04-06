import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

interface ClassConstructor {
  new (...args: any[]): any;
}

export function Serializer(dto: ClassConstructor) {
  return UseInterceptors(new SerializerInterceptor(dto));
}

export class SerializerInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const res = context.switchToHttp().getResponse<Response>();
    const statusCode = res.statusCode;

    return next.handle().pipe(
      map((data: any) => {
        return {
          statusCode,
          message: 'Success ✅✅✅',
          metadata: plainToInstance(this.dto, data, {
            excludeExtraneousValues: true,
            // Thêm option này để xử lý tốt cả Array và Object đơn lẻ
            enableImplicitConversion: true,
          }),
        };
      }),
    );
  }
}
