import { Module, NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import pgConfig from './configs/pg.config';
import s3ClientConfig from './configs/aws.config';
import { ErrorExceptionFilter } from './exception-filters/error-exception.filter';
import { JwtAuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { OvInterceptor } from './interceptors/ov.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/management/permissions/permissions.module';
import { StoresModule } from './modules/inventory/stores/stores.module';
import { JwtAuthStrategy } from './strategies/auth.strategy';
import { InventoriesModule } from './modules/inventory/inventories/inventories.module';
import { ProductsModule } from './modules/catalog/products-SPU/products.module';
import { CategoriesModule } from './modules/catalog/categories/categories.module';
import { BrandsModule } from './modules/catalog/brands/brands.module';
import { ProductVariantsModule } from './modules/catalog/product-variants-SKU/product-variants.module';
import { ProductItemsModule } from './modules/catalog/product-items-SERIAL/product-items.module';
import { ProductImagesModule } from './modules/catalog/product-images/product-images.module';
import { VouchersModule } from './modules/payments/vouchers/vouchers.module';
import { ApiGuard } from './guards/api.guard';
import { S3Module } from './common/s3/s3.module';
import { OrdersModule } from './modules/customer/orders/orders.module';
import { OrderItemsModule } from './modules/customer/order-items/order-items.module';
import { MoMoModule } from './modules/payments/momo/momo.module';
import { VnPayModule } from './modules/payments/vnpay/vnpay.module';
import { ZaloPayModule } from './modules/payments/zalopay/zalopay.module';
import { RatingModule } from './modules/customer/rating/rating.module';
import { ProductNavbarModule } from './modules/catalog/product-navbar/product-navbar.module';
import { CustomerProductsModule } from './modules/customer/customer-products/customer-products.module';
import { PromotionsModule } from './modules/marketing-program/promotions/promotions.module';
import { CartsModule } from './modules/customer/carts/carts.module';
import { TeamCategoriesModule } from './modules/management/team-categories/team-categories.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import cloudinaryConfig from './configs/cloudinary.config';
import { StaffsModule } from './modules/management/staffs/staffs.module';
import { RolesModule } from './modules/management/roles/roles.module';
import { LocationRegionsModule } from './modules/inventory/location-regions/location-regions.module';
import { TeamsModule } from './modules/management/teams/teams.module';
import { CustomersModule } from './modules/customer/customers/customers.module';
import { CartItemsModule } from './modules/customer/cart-items/cart-items.module';
import { ProductPromotionsModule } from './modules/marketing-program/product-promotions/product-promotions.module';
import { CampaignModule } from './modules/marketing-program/campaigns/campaigns.module';
import { CategoryPromotionModule } from './modules/marketing-program/category-promotions/category-promotion.module';
import redisConfig from './configs/redis.config';
import { CacheModule } from './common/cache/cache.module';
import { BullMqModule } from './common/bull/bull.module';
import { AuditLogsModule } from './modules/management/audit-logs/audit-logs.module';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotificationModule } from './common/notification/notification.module';
import { CustomerTokensModule } from './modules/customer/customer-tokens/customer-tokens.module';
import { TaskModule } from './common/tasks/task.module';
import { MainBannerModule } from './modules/catalog/main-banner/main-banner.module';
import { MarketingProgramsModule } from './modules/marketing-program/marketing-programs/marketing-programs.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';

const isProd = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    // Cấu hình biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig, s3ClientConfig, cloudinaryConfig, redisConfig],
      envFilePath: isProd ? '.env' : '.env.dev',
    }),

    // Cấu hình kết nối database với TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const pgConfig = config.get<TypeOrmModuleOptions>('postgres') || null;

        if (!pgConfig) throw new NotFoundException('Database name not found in environment variables');

        return pgConfig;
      },
    }),

    // THROTTLER Tầng 1: chặn theo ip client
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', limit: 100, ttl: 60000 }], // Giới hạn 100 yêu cầu mỗi phút cho mỗi IP
    }),

    // Module chung
    CacheModule,
    BullMqModule,
    CloudinaryModule,
    TaskModule,
    MetricsModule,

    // Các module chức năng của ứng dụng
    AuthModule,
    StaffsModule,
    RolesModule,
    PermissionsModule,
    LocationRegionsModule,
    StoresModule,
    InventoriesModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    ProductVariantsModule,
    ProductItemsModule,
    ProductImagesModule,
    ProductPromotionsModule,
    CustomersModule,
    VouchersModule,
    S3Module,
    OrdersModule,
    OrderItemsModule,
    MoMoModule,
    VnPayModule,
    ZaloPayModule,
    RatingModule,
    ProductNavbarModule,
    CustomerProductsModule,
    PromotionsModule,
    CampaignModule,
    CategoryPromotionModule,
    CartsModule,
    CartItemsModule,
    TeamsModule,
    TeamCategoriesModule,
    AuditLogsModule,
    NotificationModule,
    CustomerTokensModule,
    MainBannerModule,
    MarketingProgramsModule,
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
      provide: APP_INTERCEPTOR,
      useClass: OvInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ApiGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorExceptionFilter,
    },
  ],
})
export class AppModule {}
