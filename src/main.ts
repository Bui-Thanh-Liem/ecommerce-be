import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoginGuard } from './guards/auth/login.guard';
import { TimeInterceptor } from './intercetors/time/time.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global prefix
  app.setGlobalPrefix('api');

  // Add global middleware

  // Add global guards
  // app.useGlobalGuards(new LoginGuard());

  // Add global interceptors
  // app.useGlobalInterceptors(new TimeInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
