import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  //
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT ?? 3001;
  const type = process.env.TYPE || 'api';

  //
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd ? new AppLogger() : undefined,
  });

  // X-Forwarded-For=1.1.1.1, 2.2.2.2, 3.3.3.3 -> phải sang trái bỏ qua 1 lấy cái tiếp theo -> 2.2.2.2
  app.set('trust proxy', 1);

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
    .addTag('App')
    .addTag('Auth')
    .addTag('StaffTokens')
    .addTag('Staffs')
    .addTag('Permissions')
    .addTag('Roles')
    .addTag('LocationRegions')
    .addTag('Stores')
    .addTag('Teams')
    .addTag('Brands')
    .addTag('Categories')
    .addTag('Products') // SPU
    .addTag('ProductImages')
    .addTag('ProductVariants') // SKU
    .addTag('Inventories')
    .addTag('ProductItems') // SERIAL
    .addTag('ProductPromotions')
    .addTag('Customers')
    .addTag('Orders')
    .addTag('OrderItems')
    .addTag('Vouchers')

    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ lại thông tin xác thực sau khi refresh trang
    },
  });

  // Chỉ khởi tạo ứng dụng, không cần listen HTTP
  if (type === 'worker') {
    await app.init();
    return;
  }

  // Khởi động ứng dụng HTTP
  await app.listen(port);
}

bootstrap()
  //
  .then(() => {
    const port = process.env.PORT ?? 3001;
    const type = process.env.TYPE || 'api';
    console.log(`Application is running on: ${port} (mode: ${type})`);
  })

  //
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  })

  //
  .finally(() => {
    console.log('Bootstrap process completed.');
  });

/**
| Cấu hình     | Proxy được tin?         | `req.ip`                         |
| ------------ | ----------------------- | -------------------------------- |
| `false`      | Không                   | IP proxy                         |
| `1`          | Tin 1 proxy phía trước  | IP client                        |
| `true`       | Tin mọi proxy           | IP client                        |
| `'loopback'` | Chỉ tin proxy localhost | IP client nếu proxy là localhost | NestJS và Nginx chung 1 máy chủ
 */

// Client (IP: 1.2.3.4) -> Cloudflare / Nginx (IP: 5.6.7.8) -> NestJS (IP: 10.0.0.1)

// Proxy luôn tự động đính kèm IP thật của Client Header X-Forwarded-For:1.2.3.4 trước khi gửi request tiếp cho NestJS

// Nếu không bật trust proxy, NestJS sẽ lờ cái Header đó đi (req.id = IP proxy)

// Khi bạn bật trust proxy, NestJS đọc IP ở trong Header X-Forwarded-For
