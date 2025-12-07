import { ConsoleLogger } from '@nestjs/common';

export class MyLoggerDev extends ConsoleLogger {
  log(message: unknown, context?: string, ...rest: unknown[]): void {
    console.log(`[${context}] | `, message);
  }
}
