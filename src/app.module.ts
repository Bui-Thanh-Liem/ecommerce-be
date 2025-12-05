import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { LogMiddleware } from './middlewares/log/log.middleware';
import { LoginGuard } from './guards/auth/login.guard';
import { TimeInterceptor } from './interceptors/time/time.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UploadService } from './modules/upload/upload.service';
import { UploadController } from './modules/upload/upload.controller';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController, UploadController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: LoginGuard, // để có thể sử dụng hàm của AppService trong LoginGuard
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TimeInterceptor,
    },
    UploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Add global middleware
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.POST });
  }
}
