import { JOB_NAMES } from '@/shared/constants/bull.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    @InjectQueue('audit-log')
    private readonly auditLogQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.auditLogQueue.upsertJobScheduler(JOB_NAMES.REMOVE_OLD_LOGS, { pattern: '0 0 * * *' }); // Chạy vào lúc 00:00 hàng ngày
  }

  //
  // ... Các phương thức xử lý tác vụ khác nếu cần
}
