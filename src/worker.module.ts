import { Module, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import pgConfig from './configs/pg.config';
import s3ClientConfig from './configs/aws.config';
import cloudinaryConfig from './configs/cloudinary.config';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import redisConfig, { RedisOptions } from './configs/redis.config';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { CloudinaryConsumer } from './common/cloudinary/cloudinary.consumer';

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

    // Cấu hình kết nối Redis cho BullMQ
    BullModule.forRootAsync('ecommerce-configuration', {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): BullRootModuleOptions => {
        const configRedis = config.get<RedisOptions>('redis') || null;

        if (!configRedis) throw new NotFoundException('Redis configuration not found in environment variables');

        return {
          connection: {
            host: configRedis.host,
            port: configRedis.port,
          },
        };
      },
    }),

    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    //
    CloudinaryModule, // Cần cho cấu hình queue và provider của Cloudinary
  ],
  controllers: [],
  providers: [CloudinaryConsumer],
})
export class WorkerModule {}
