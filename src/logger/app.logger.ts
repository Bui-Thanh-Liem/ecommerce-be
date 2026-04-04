import { LoggerService } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class AppLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    const dailyRotateFile = (level: string) =>
      new DailyRotateFile({
        level,
        dirname: `logs/${level}`, // thư mục riêng cho từng loại log
        filename: '%DATE%.log', // tên file: 2025-12-06.log
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d', // giữ trong 14 ngày
        format: format.combine(format.timestamp(), format.json()),
      });

    this.logger = createLogger({
      level: 'info',
      transports: [
        // Console log màu
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ level, context, message, time }) => {
              const strApp = chalk.green('NEST');
              const _message = typeof message === 'object' ? (message as { message: string }).message : message;

              // eslint-disable-next-line max-len
              // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
              const strContext = chalk.yellow(`[${context || 'App'}]`);
              // eslint-disable-next-line max-len
              // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
              return `${strApp} - ${time} ${level} ${strContext} ${_message}`;
            }),
            format.timestamp(),
          ),
        }),

        // File log theo ngày — mỗi level 1 folder + 1 file mỗi ngày
        dailyRotateFile('error'),
        dailyRotateFile('warn'),
        dailyRotateFile('info'),
      ],
    });
  }

  log(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('info', message, { context, time });
  }
  error(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('error', message, { context, time });
  }
  warn(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('warn', message, { context, time });
  }
  debug?(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('debug', message, { context, time });
  }
  verbose?(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('verbose', message, { context, time });
  }
  fatal?(message: string, context: string) {
    const time = dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('fatal', message, { context, time });
  }
}

// error	Lỗi nghiêm trọng
// warn	Cảnh báo
// info	Thông tin
// http	Log request
// verbose	Chi tiết nhiều
// debug	Debug
// silly	Rất nhiều log lung tung
