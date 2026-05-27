import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Logger } from '@nestjs/common';

@Processor('cloudinary')
export class CloudinaryConsumer extends WorkerHost {
  private readonly logger = new Logger(CloudinaryConsumer.name);

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
        case 'upload-image':
          return await this.handleUploadImage(job as any);

        case 'delete-image':
          return await this.handleDeleteImage(job as any);

        case 'delete-multiple-images':
          return await this.handleDeleteMultipleImages(job as any);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleUploadImage(
    job: Job<{ fileBuffer: Buffer; originalname: string; folder: string }>,
  ): Promise<UploadApiResponse> {
    this.logger.debug(`[JOB-${job.id}] Uploading to folder: ${job.data.folder}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: job.data.folder,
          resource_type: 'image',
          public_id: job.data.originalname.split('.')[0],
        },
        (error, result) => {
          if (error) {
            this.logger.error(`[JOB-${job.id}] Upload error: ${error.message}`);
            return reject(new Error(`Cloudinary Upload Failed: ${error.message}`));
          }

          if (result) {
            this.logger.log(`[JOB-${job.id}] ✅ Upload success: ${result.public_id}`);
            resolve(result);
          }
        },
      );

      uploadStream.end(job.data.fileBuffer);
    });
  }

  private async handleDeleteImage(job: Job<{ publicId: string }>): Promise<any> {
    const publicId = job.data.publicId;
    this.logger.debug(`[JOB-${job.id}] Deleting: ${publicId}`);

    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDestroyResponse;

      if (result.result !== 'ok' && result.result !== 'not_found') {
        throw new Error(`Unexpected Cloudinary response: ${result.result}`);
      }

      this.logger.log(`[JOB-${job.id}] ✅ Delete success: ${result.result}`);
      return { success: true, result: result.result, publicId: job.data.publicId };
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteMultipleImages(job: Job<{ publicIds: string[] }>): Promise<any> {
    const publicIds = job.data.publicIds;
    this.logger.debug(`[JOB-${job.id}] Bulk deleting ${publicIds.length} images`);

    try {
      const response = (await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
      })) as CloudinaryDeleteResourcesResponse;

      this.logger.log(`[JOB-${job.id}] ✅ Bulk delete completed. Deleted: ${Object.keys(response.deleted).length}`);
      return response;
    } catch (error) {
      throw new Error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

interface CloudinaryDeleteResourcesResponse {
  deleted: Record<string, 'deleted' | 'not_found'>;
  partial: boolean;
}

interface CloudinaryDestroyResponse {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  result: 'ok' | 'not_found' | string;
}
