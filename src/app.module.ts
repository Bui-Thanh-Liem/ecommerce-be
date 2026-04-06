import { Module, NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import pgConfig from './configs/pg.config';
import { ErrorExceptionFilter } from './exception-filters/http-exception.filter';
import { JwtAuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { OvInterceptor } from './interceptors/ov.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LocationRegionsModule } from './modules/location-regions/location-regions.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { StaffTokensModule } from './modules/staff-tokens/staff-tokens.module';
import { StaffsModule } from './modules/staffs/staffs.module';
import { StoresModule } from './modules/stores/stores.module';
import { JwtAuthStrategy } from './strategies/auth.strategy';
import { InventoriesModule } from './modules/inventories/inventories.module';
import { ProductsModule } from './modules/products-SPU/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductVariantsModule } from './modules/product-variants-SKU/product-variants.module';
import { ProductItemsModule } from './modules/product-items-SERIAL/product-items.module';
import { ProductImagesModule } from './modules/product-images/product-images.module';
import { ProductPromotionsModule } from './modules/product-promotions/product-promotions.module';

const isProd = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    //
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig],
      envFilePath: isProd ? '.env' : '.env.dev',
    }),

    //
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const pgConfig = config.get<TypeOrmModuleOptions>('postgres') || null;

        if (!pgConfig) throw new NotFoundException('Database name not found in environment variables');

        return pgConfig;
      },
    }),
    StaffsModule,
    AuthModule,
    LocationRegionsModule,
    StoresModule,
    StaffTokensModule,
    PermissionsModule,
    RolesModule,
    CustomersModule,
    InventoriesModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    ProductVariantsModule,
    ProductItemsModule,
    ProductImagesModule,
    ProductPromotionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthStrategy,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // Tùy chọn 0: Bật tính năng loại bỏ các thuộc tính không được định nghĩa trong DTO và trả về lỗi nếu có
        forbidNonWhitelisted: true,
        // Tùy chọn 1: Loại bỏ các thuộc tính không được định nghĩa trong DTO
        whitelist: true,
        // Tùy chọn 2: Biến đổi dữ liệu đầu vào thành instance của DTO
        transform: true,
        // Tùy chọn 3: Nếu bạn muốn chuyển đổi chuỗi thành kiểu dữ liệu nguyên thủy
        // Ví dụ: '123' thành 123 nếu bạn dùng @IsNumber() trên tham số query
        transformOptions: {
          enableImplicitConversion: true, // Cho phép chuyển đổi ngầm định, ví dụ: '1' thành true nếu dùng @IsInt()
        },
      }),
    },
    {
      provide: APP_FILTER,
      useClass: ErrorExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OvInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
