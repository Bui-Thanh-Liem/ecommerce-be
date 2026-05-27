/* eslint-disable max-len */
import { Module, Global, NotFoundException } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';
import { RedisOptions } from '@/configs/redis.config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configRedis = configService.get<RedisOptions>('redis');

        if (!configRedis) {
          throw new NotFoundException('Redis configuration not found in environment variables');
        }

        const redisUrl = configRedis.password
          ? `redis://:${configRedis.password}@${configRedis.host}:${configRedis.port}`
          : `redis://${configRedis.host}:${configRedis.port}`;

        return {
          stores: [createKeyv(redisUrl, { namespace: 'cache-ecommerce' })],
        };
      },
    }),
  ],
  providers: [CacheService], // Đăng ký Wrapper Service
  exports: [CacheService], // Export Wrapper Service ra ngoài
})
export class CacheModule {}

/**
 * 1. @nestjs/cache-manager => Dependency Injection
 *
 * 2. cache-manager => Cung cấp API cache đơn giản: get, set, del, reset,... hỗ trợ TTL
 *
 * 3. keyv + @keyv/redis => Là adapter để kết nối cache-manager với Redis, giúp cache-manager có thể sử dụng Redis làm backend lưu trữ cache
 *
 *
 * Lý do sử dụng keyv + @keyv/redis thay vì ioredis trực tiếp:
 * - cache-manager có sẵn API cache đơn giản, giúp tập trung vào logic cache mà không phải lo lắng về cách kết nối và tương tác với Redis.
 * - keyv + @keyv/redis là adapter đã được cache-manager hỗ trợ chính thức, giúp tích hợp dễ dàng và ổn định hơn so với việc tự viết code kết nối ioredis.
 * - Sử dụng adapter giúp tách biệt rõ ràng giữa logic cache (cache-manager) và cách thức lưu trữ (Redis), giúp code dễ bảo trì và mở rộng nếu muốn đổi sang backend khác.
 */
