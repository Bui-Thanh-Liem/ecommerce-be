import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CreateCustomerProductDto } from '@/modules/customer/customer-products/dto/create-customer-product.dto';
import { CustomerEntity } from '@/modules/customer/customers/entities/customer.entity';
import { IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { CustomerProductsService } from '@/modules/customer/customer-products/customer-products.service';

@Processor('customer-product')
export class CustomerProductProcessor extends WorkerHost {
  private readonly logger = new Logger(CustomerProductProcessor.name);

  constructor(private customerProductService: CustomerProductsService) {
    super();
  }

  async process(job: Job<handleCreateSuggestProduct, any, string>): Promise<any> {
    this.logger.log(`[JOB-${job.id}] ▶️  Starting: ${job.name}`);

    try {
      switch (job.name) {
        case 'create-suggest-product':
          return await this.handleCreateSuggestProduct(job as handleCreateSuggestProductJob);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleCreateSuggestProduct(job: handleCreateSuggestProductJob): Promise<any> {
    const customerOrGuest = job.data.customer?.id || job.data.guest?.session;
    this.logger.debug(`[JOB-${job.id}] Creating suggest product: ${customerOrGuest}`);

    try {
      const result = await this.customerProductService.create({
        dto: job.data.dto,
        guest: job.data.guest,
        customer: job.data.customer,
      });

      if (!result) {
        throw new Error(`Unexpected response: ${result}`);
      }

      this.logger.log(`[JOB-${job.id}] ✅ Create success: ${result}`);
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

type handleCreateSuggestProduct = { dto: CreateCustomerProductDto; guest?: IInfoGuest; customer?: CustomerEntity };
type handleCreateSuggestProductJob = Job<handleCreateSuggestProduct>;
