import {
  MiddlewareConsumer,
  Module,
  NestModule,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OvInterceptor } from './interceptors/ov.interceptor';
import { LogMiddleware } from './middlewares/log/log.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RolesModule } from './modules/roles/roles.module';
import { TokenModule } from './modules/token/token.module';
import { UploadController } from './modules/upload/upload.controller';
import { UploadService } from './modules/upload/upload.service';
import { UserModule } from './modules/user/user.module';
import { OptionValueModule } from './modules/prod/option-value/option-value.module';
import { OptionModule } from './modules/prod/option/option.module';
import { ProductVariantModule } from './modules/prod/product-variant/product-variant.module';
import { ProductsModule } from './modules/prod/product/product.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mysqlConfig from './config/mysql.conf';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAccessGuard } from './modules/auth/guards/jwt-access.guard';
import { PermissionsGuard } from './modules/permission/guards/permission.guard';

console.log(mysqlConfig);

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      load: [mysqlConfig],
    }),

    // Database/ORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mysqlConfig = configService.get<TypeOrmModuleOptions>('mysql');

        if (!mysqlConfig) {
          throw new NotFoundException('MySQL configuration not found');
        }

        return mysqlConfig;
      },
    }),

    // JWT
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'JWT_ACCESS_SECRET',
      signOptions: { expiresIn: '1h' },
    }),

    // Application modules
    UserModule,
    AuthModule,
    TokenModule,
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

    // 1. Chạy đầu tiên – Kiểm tra JWT
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },

    // 2. Chạy thứ hai – Kiểm tra Permission
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },

    // Global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: OvInterceptor,
    },
    UploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Add global middleware
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.POST });
  }
}
