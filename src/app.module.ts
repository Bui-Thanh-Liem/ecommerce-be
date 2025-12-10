import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginGuard } from './guards/auth/login.guard';
import { TimeInterceptor } from './interceptors/time/time.interceptor';
import { LogMiddleware } from './middlewares/log/log.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RolesModule } from './modules/roles/roles.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { UploadController } from './modules/upload/upload.controller';
import { UploadService } from './modules/upload/upload.service';
import { UsersModule } from './modules/users/users.module';
import { OptionValueModule } from './modules/prod/option-value/option-value.module';
import { OptionModule } from './modules/prod/option/option.module';
import { ProductVariantModule } from './modules/prod/product-variant/product-variant.module';
import { ProductsModule } from './modules/prod/products/products.module';

@Module({
  imports: [
    // Database
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'ecommerce',
      synchronize: false,
      logging: true,
      entities: ['dist/src/modules/**/entities/*.entity.js'],
      migrations: ['dist/src/migrations/*.js'],
      migrationsTableName: 'migrations',
      poolSize: 10,
      connectorPackage: 'mysql2',
    }),

    UsersModule,
    AuthModule,
    TokensModule,
    ProductsModule,
    RolesModule,
    PermissionModule,
    ProductVariantModule,
    OptionValueModule,
    OptionModule,
  ],
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
