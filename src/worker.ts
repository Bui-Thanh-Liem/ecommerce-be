import { NestFactory } from '@nestjs/core';
import { AppLogger } from './logger/app.logger';
import { WorkerModule } from './worker.module';

/**
 * Worker Process - Xử lý BullMQ jobs riêng biệt với main API server
 * Chạy: npm run start:worker
 * Job sẽ thực thi trên process riêng này, không block main thread
 */
async function startWorker() {
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: isProd ? new AppLogger() : undefined,
  });

  // Đảm bảo worker tắt an toàn khi ứng dụng bị stop (khi deploy)
  app.enableShutdownHooks();

  // Worker chỉ cần xử lý jobs, không cần HTTP server
  // Nhưng phải init AppModule để load BullModule + Consumer
  console.log('[BullMQ Worker] 🚀 Starting BullMQ Worker Process...');
  console.log(`[BullMQ Worker] Environment: ${isProd ? 'production' : 'development'}`);
  console.log('[BullMQ Worker] Worker is ready. Waiting for jobs...');

  // Không cần listen HTTP, chỉ cần app initialized
  // BullMQ Consumer sẽ tự động bắt đầu lắng nghe queue từ Redis
  await app.init();
}

startWorker().catch((error) => {
  console.error('[BullMQ Worker] Failed to start worker:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[BullMQ Worker] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[BullMQ Worker] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
