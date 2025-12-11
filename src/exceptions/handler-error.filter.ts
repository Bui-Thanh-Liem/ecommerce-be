import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch() // catch tất cả lỗi
export class ErrorExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // 🔥 Log tất cả lỗi (prod safe)
    this.logger.error(
      `[${request.method}] ${request.url}`,
      (exception as any).stack || exception,
    );

    // 1. Nếu là HttpException -> xử lý chuẩn Nest
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any)?.message;
    }

    // 2. QueryFailedError (TypeORM)
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query error';
    }

    // 3. Lỗi TypeError (runtime JS)
    else if (exception instanceof TypeError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid operation or type error';
    }

    // 4. Unknown error → giữ status = 500
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      stack: (exception as any).stack,
    });
  }
}
