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
import { Permission } from './modules/permission/entities/permission.entity';
import { PermissionModule } from './modules/permission/permission.module';
import { Product } from './modules/products/entities/product.entity';
import { ProductsModule } from './modules/products/products.module';
import { Role } from './modules/roles/entities/role.entity';
import { RolesModule } from './modules/roles/roles.module';
import { Token } from './modules/tokens/entities/token.entity';
import { TokensModule } from './modules/tokens/tokens.module';
import { UploadController } from './modules/upload/upload.controller';
import { UploadService } from './modules/upload/upload.service';
import { User } from './modules/users/entities/user.entity';
import { UsersModule } from './modules/users/users.module';

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
      synchronize: true,
      logging: true,
      entities: [User, Token, Product, Role, Permission],
      migrations: [],
      subscribers: [],
    }),

    UsersModule,
    AuthModule,
    TokensModule,
    ProductsModule,
    RolesModule,
    PermissionModule,
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
