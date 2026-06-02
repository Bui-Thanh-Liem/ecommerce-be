import { Global, Module, NotFoundException } from '@nestjs/common';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisOptions } from '@/configs/redis.config';
import { CloudinaryProcessor } from './cloudinary.processor';
import { AuditLogProcessor } from './audit-log.processor';

@Global()
@Module({
  imports: [
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

    // Đăng ký queue 'cloudinary' với các tùy chọn mặc định cho job
    BullModule.registerQueue({
      configKey: 'ecommerce-configuration',
      name: 'cloudinary',

      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,

        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),

    BullModule.registerQueue({
      configKey: 'ecommerce-configuration',
      name: 'audit-log',

      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,

        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),

    // BOARD: Cấu hình Bull Board để quản lý các queue của BullMQ
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    // BOARD: Đăng ký Bull Board cho queue 'cloudinary' để có thể quản lý qua giao diện web
    BullBoardModule.forFeature({
      name: 'cloudinary',
      adapter: BullMQAdapter,
    }),

    // BOARD: Đăng ký Bull Board cho queue 'audit-log' để có thể quản lý qua giao diện web
    BullBoardModule.forFeature({
      name: 'audit-log',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [CloudinaryProcessor, AuditLogProcessor],
  controllers: [],
  exports: [BullModule],
})
export class BullMqModule {}
