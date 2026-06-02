import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CreateAuditLogDto } from '@/modules/management/audit-logs/dto/create-audit-log.dto';
import { AuditLogsService } from '@/modules/management/audit-logs/audit-logs.service';
import { UpdateAuditLogDto } from '@/modules/management/audit-logs/dto/update-audit-log.dto';

@Processor('audit-log')
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(private auditLogService: AuditLogsService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`[JOB-${job.id}] ▶️  Starting: ${job.name}`);

    try {
      switch (job.name) {
        case 'create-audit-log':
          return await this.handleCreateAuditLog(job as Job<CreateAuditLogDto>);

        case 'update-audit-log':
          return await this.handleUpdateAuditLog(job as handleUpdateAuditLog);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[JOB-${job.id}] ❌ Failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleCreateAuditLog(job: Job<CreateAuditLogDto>) {
    this.logger.debug(`[JOB-${job.id}] Creating audit log: ${job.data.keySession}`);
    return await this.auditLogService.create(job.data);
  }

  private async handleUpdateAuditLog(job: handleUpdateAuditLog) {
    this.logger.debug(`[JOB-${job.id}] Updating audit log: ${job.data.keySession}`);
    return await this.auditLogService.update(job.data.keySession, job.data.updateAuditLogDto);
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    this.logger.error(
      // eslint-disable-next-line max-len
      `[JOB-${job.id}] 🚨 Job [${job.name}] failed completely after ${job.attemptsMade} attempts. Reason: ${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    this.logger.log(`[JOB-${job.id}] 🎉 Job [${job.name}] completed successfully.`);
  }
}

type handleUpdateAuditLog = Job<{ keySession: string; updateAuditLogDto: UpdateAuditLogDto }>;
