import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';

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
    credentials: true,
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

    // Thêm bảo mật cookie cho Swagger UI
    // Cho Swagger UI biết là cần gì
    // Cấu hình hiện tại (Cookie) thì trình duyệt đã tự động gửi rồi.
    .addCookieAuth(
      'token',
      {
        in: 'cookie',
        name: 'token',
        type: 'apiKey',
        description: 'Authentication token stored in cookie',
      },
      'cookie-auth',
    )

    .addSecurityRequirements('cookie-auth') // Áp dụng bảo mật cookie cho tất cả các endpoint

    // Sắp xếp lại
    .addTag('Auth')
    .addTag('Staffs')
    .addTag('Permissions')
    .addTag('Roles')
    .addTag('LocationRegions')
    .addTag('Stores')
    .addTag('Brands')
    .addTag('Categories')
    .addTag('Products') // SPU
    .addTag('ProductImages')
    .addTag('ProductVariants') // SKU
    .addTag('Inventories')
    .addTag('ProductItems') // SERIAL
    .addTag('ProductPromotions')
    .addTag('Vouchers')

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
