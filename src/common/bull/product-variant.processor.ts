import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { GenerateProductEmbedDto } from '../gemini-rag/dto/generate-product-embed.dto';
import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';

@Processor('product-variant')
export class ProductVariantProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductVariantProcessor.name);

  constructor(private productVariantService: ProductVariantsService) {
    super();
  }

  async process(job: Job<handleCreateProductEmbed, any, string>): Promise<any> {
    this.logger.log(`[JOB-${job.id}] ▶️  Starting: ${job.name}`);

    try {
      switch (job.name) {
        case 'create-product-embed':
          return await this.handleCreateProductEmbed(job as handleCreateProductEmbedJob);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleCreateProductEmbed(job: handleCreateProductEmbedJob): Promise<any> {
    const variantId = job.data.id;
    this.logger.debug(`[JOB-${job.id}] Creating variant product embed: ${variantId}`);

    try {
      const result = await this.productVariantService.createProductEmbed({
        id: job.data.id,
        dataEmbed: job.data.dto,
      });

      if (!result) {
        throw new Error(`Unexpected response: ${variantId}`);
      }

      this.logger.log(`[JOB-${job.id}] ✅ Create success: ${variantId}`);
      return { success: true, result: result };
    } catch (error) {
      throw new Error(`Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    this.logger.error(
      // eslint-disable-next-line max-len
      `[JOB-${job.id}] 🚨 Job [${job.name}] failed completely after ${job.attemptsMade} attempts. Reason: ${error.message}`,
    );
    // Bắn alert (Slack/Telegram) tại đây để truy vết tracking nhanh
  }

  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    this.logger.log(`[JOB-${job.id}] 🎉 Job [${job.name}] completed successfully.`);
  }
}

type handleCreateProductEmbed = { id: string; dto: GenerateProductEmbedDto };
type handleCreateProductEmbedJob = Job<handleCreateProductEmbed>;
