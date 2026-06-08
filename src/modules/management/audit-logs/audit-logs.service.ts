import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { Repository } from 'typeorm';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { AuditLogQueryDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(query: AuditLogQueryDto) {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .select([
        'auditLog.id',
        'auditLog.staffId',
        'auditLog.username',
        'auditLog.email',
        'auditLog.phone',
        'auditLog.ipAddress',
        'auditLog.userAgent',
        'auditLog.method',
        'auditLog.endpoint',
        'auditLog.desc',
        'auditLog.statusCode',
        'auditLog.requestPayload',
        'auditLog.responsePayload',
        'auditLog.status',
        'auditLog.createdAt',
      ])
      .skip(skip)
      .take(take)
      .orderBy('auditLog.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async update(keySession: string, updateAuditLogDto: UpdateAuditLogDto) {
    //
    const auditLog = await this.auditLogRepository.findOne({ where: { keySession } });
    if (!auditLog) throw new NotFoundException('Audit log not found');

    //
    this.auditLogRepository.merge(auditLog, updateAuditLogDto);
    return await this.auditLogRepository.save(auditLog);
  }

  async remove(id: string) {
    //
    const auditLog = await this.auditLogRepository.findOne({ where: { id } });
    if (!auditLog) throw new NotFoundException('Audit log not found');

    //
    return await this.auditLogRepository.remove(auditLog);
  }

  //
  async remoteOldLogs() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLogEntity)
      .where('createdAt < :oneMonthAgo', { oneMonthAgo })
      .execute();
  }
}
