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
import { ProductsModule } from './modules/prod/product/product.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mysqlConfig from './config/mysql.conf';

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
      .forRoutes({ path: '*path', method: RequestMethod.POST });
  }
}
