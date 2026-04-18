import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  //
  const isProd = process.env.NODE_ENV === 'production';

  //
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? new AppLogger() : undefined,
  });

  // Add global prefix
  app.setGlobalPrefix('api/v1');

  // Add cors
  app.enableCors({
    allowedHeaders: ['Content-Type', 'x-api-key'],
  });

  // Cookies
  app.use(cookieParser());

  //
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('API documentation for E-commerce application')
    .setVersion('1.0')
    .addApiKey(
      {
        in: 'header',
        type: 'apiKey',
        name: 'x-api-key',
        description: 'Unique identifier for the request',
      },
      'x-api-key',
    )
    .addSecurityRequirements('x-api-key') // Áp dụng bảo mật cho tất cả các endpoint
    .addCookieAuth('token', {
      in: 'cookie',
      name: 'token',
      type: 'apiKey',
      description: 'Authentication token stored in cookie',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ lại thông tin xác thực sau khi refresh trang
    },
  });

  //
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
