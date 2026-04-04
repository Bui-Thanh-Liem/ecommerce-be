import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface IResponseHttpError {
  statusCode: number;
  error: string;
  message: string;
}

@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const isDev = process.env.NODE_ENV === 'dev';

    //
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: string = 'Internal Server Error';
    let message = 'Internal server error';
    const ownDev: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      path: req.url,
      user: req.user || null,
      body: req.body as Record<string, any>,
      queries: req.query as Record<string, any>,
      params: req.params as Record<string, any>,
    };

    // 1. Nếu là HttpException -> xử lý chuẩn Nest
    if (exception instanceof HttpException) {
      const _exception = exception as unknown as HttpException;
      const resErr = _exception.getResponse() as IResponseHttpError | string;

      status = _exception.getStatus();
      message = typeof resErr === 'string' ? resErr : resErr.message;
      error = typeof resErr === 'string' ? resErr : resErr.error || error;
      ownDev.stack = _exception.stack;
    }

    // 2. QueryFailedError (TypeORM)
    else if (exception instanceof QueryFailedError) {
      const _exception = exception as unknown as QueryFailedError;
      status = HttpStatus.BAD_REQUEST;
      message = _exception.message || 'Database query failed';
      error = 'Database Error';
      ownDev.stack = _exception.stack;
    }

    // 3. Lỗi TypeError (runtime JS)
    else if (exception instanceof TypeError) {
      const _exception = exception as unknown as TypeError;
      status = HttpStatus.BAD_REQUEST;
      message = _exception.message || 'Type error occurred';
      error = 'Type Error';
      ownDev.stack = _exception.stack;
    }

    //
    const responseClient = {
      error,
      message,
      statusCode: status,
      ...(isDev ? ownDev : {}),
    };

    // Ghi log lỗi chi tiết vào file log
    this.logger.error({ ...responseClient, ...ownDev });

    // Log lỗi ra console (chỉ log message, stack trace nếu là dev)
    res.status(status).json(responseClient);
  }
}
