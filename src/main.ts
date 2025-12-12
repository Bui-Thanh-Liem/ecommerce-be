import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ErrorExceptionFilter } from './exceptions/handler-error.filter';
import { MyLogger } from './logger/my.logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new MyLogger(),
  });

  // Use global logger
  // app.useLogger(new MyLogger());

  // Add global prefix
  app.setGlobalPrefix('api');

  // Add cors
  app.enableCors();

  // Add global middleware

  // Add global guards
  // app.useGlobalGuards(new LoginGuard());

  // Add global interceptors
  // app.useGlobalInterceptors(new TimeInterceptor());

  // Add global filters
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ErrorExceptionFilter());

  // Áp dụng ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      // Tùy chọn 1: Loại bỏ các thuộc tính không được định nghĩa trong DTO
      whitelist: true,
      // Tùy chọn 2: Biến đổi dữ liệu đầu vào thành instance của DTO
      transform: true,
      // Tùy chọn 3: Nếu bạn muốn chuyển đổi chuỗi thành kiểu dữ liệu nguyên thủy
      // Ví dụ: '123' thành 123 nếu bạn dùng @IsNumber() trên tham số query
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  console.log('__dirname = ', __dirname);
  console.log('cwd = ', process.cwd());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
