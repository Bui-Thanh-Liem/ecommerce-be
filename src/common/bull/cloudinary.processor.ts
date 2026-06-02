import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Processor('cloudinary')
export class CloudinaryProcessor extends WorkerHost {
  private readonly logger = new Logger(CloudinaryProcessor.name);

  constructor(private cloudinaryService: CloudinaryService) {
    super();
  }

  async process(
    job: Job<
      { fileBuffer: Buffer; originalname: string; folder: string } | { publicId: string } | { publicIds: string[] },
      any,
      string
    >,
  ): Promise<any> {
    this.logger.log(`[JOB-${job.id}] ▶️  Starting: ${job.name}`);

    try {
      switch (job.name) {
        case 'delete-image':
          return await this.handleDeleteImage(job as handleDelete);

        case 'delete-multiple-images':
          return await this.handleDeleteMultipleImages(job as handleBulkDelete);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleDeleteImage(job: handleDelete): Promise<any> {
    const publicId = job.data.publicId;
    this.logger.debug(`[JOB-${job.id}] Deleting: ${publicId}`);

    try {
      const result = await this.cloudinaryService.deleteImage(publicId);

      if (result.result !== 'ok' && result.result !== 'not_found') {
        throw new Error(`Unexpected Cloudinary response: ${result.result}`);
      }

      this.logger.log(`[JOB-${job.id}] ✅ Delete success: ${result.result}`);
      return { success: true, result: result.result, publicId: job.data.publicId };
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteMultipleImages(job: handleBulkDelete): Promise<any> {
    const publicIds = job.data.publicIds;
    this.logger.debug(`[JOB-${job.id}] Bulk deleting ${publicIds.length} images`);

    try {
      const response = await this.cloudinaryService.deleteMultipleImages(publicIds);

      this.logger.log(`[JOB-${job.id}] ✅ Bulk delete completed. Deleted: ${Object.keys(response.deleted).length}`);
      return response;
    } catch (error) {
      throw new Error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    this.logger.error(
      // eslint-disable-next-line max-len
      `[JOB-${job.id}] 🚨 Job [${job.name}] failed completely after ${job.attemptsMade} attempts. Reason: ${error.message}`,
    );
    // Bạn có thể tích hợp bắn alert (Slack/Telegram) tại đây để truy vết tracking nhanh
  }

  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    this.logger.log(`[JOB-${job.id}] 🎉 Job [${job.name}] completed successfully.`);
  }
}

type handleDelete = Job<{ publicId: string }>;
type handleBulkDelete = Job<{ publicIds: string[] }>;
