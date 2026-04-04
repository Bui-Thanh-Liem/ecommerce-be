import { Module, NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { StaffsModule } from './modules/staffs/staffs.module';
import { JwtAuthStrategy } from './strategies/auth.strategy';
import { ErrorExceptionFilter } from './exception-filters/http-exception.filter';
import { LocationRegionsModule } from './modules/location-regions/location-regions.module';
import { StoresModule } from './modules/stores/stores.module';
import pgConfig from './configs/pg.config';

@Module({
  imports: [
    //
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig],
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
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
          enableImplicitConversion: true,
        },
      }),
    },
    {
      provide: APP_FILTER,
      useClass: ErrorExceptionFilter,
    },
  ],
})
export class AppModule {}
