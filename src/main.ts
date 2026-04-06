import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import cookieParser from 'cookie-parser';

console.log('process.env.PORT :::', process.env.PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: undefined, // Disable default logger
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
