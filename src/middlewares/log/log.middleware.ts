import { Injectable, NestMiddleware } from '@nestjs/common';
import { log } from 'console';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    log(`Request... ${req.method} ${req.originalUrl}`);
    next();
  }
}
