import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryController } from './cloudinary.controller';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Global()
@Module({
  imports: [
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

    BullBoardModule.forFeature({
      name: 'cloudinary',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [CloudinaryService, CloudinaryProvider],
  controllers: [CloudinaryController],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
