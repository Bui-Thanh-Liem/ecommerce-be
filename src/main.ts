import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
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
