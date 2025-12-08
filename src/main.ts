import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ErrorExceptionFilter } from './exceptions/handler-error.filter';
import { MyLogger } from './logger/my.logger';

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

  console.log('__dirname = ', __dirname);
  console.log('cwd = ', process.cwd());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
