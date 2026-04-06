import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? new AppLogger() : undefined,
  });

  // Add global prefix
  app.setGlobalPrefix('api/v1');

  // Add cors
  app.enableCors();

  // Cookies
  app.use(cookieParser());

  //
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
