import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { RagService } from '@/modules/chatbot/rag/rag.service';
import { type DocumentType } from '@/modules/chatbot/document/document.type';
import { IngestVariantDto } from '@/modules/chatbot/rag/dto/ingest-variant.dto';

@Processor('rag')
export class RagProcessor extends WorkerHost {
  private readonly logger = new Logger(RagProcessor.name);

  constructor(private ragService: RagService) {
    super();
  }

  async process(job: Job<handleIngestVariant, any, string>): Promise<any> {
    this.logger.log(`[JOB-${job.id}] ▶️  Starting: ${job.name}`);

    try {
      switch (job.name) {
        case 'ingest-variant':
          return await this.handleIngestVariant(job as handleIngestVariantJob);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleIngestVariant(job: handleIngestVariantJob): Promise<any> {
    const data = job.data;

    this.logger.debug(`[JOB-${job.id}] Ingesting variant: ${data.variant.sku} with type: ${data.type}`);

    try {
      const result = await this.ragService.ingestVariant(job.data.variant, job.data.type);

      if (!result) {
        throw new Error('Unexpected response: result is null or undefined');
      }

      this.logger.log(`[JOB-${job.id}] ✅ Create success: ${result.sku}`);
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

type handleIngestVariant = { variant: IngestVariantDto; type: DocumentType };
type handleIngestVariantJob = Job<handleIngestVariant>;
