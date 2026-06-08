/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CreateAuditLogDto } from '@/modules/management/audit-logs/dto/create-audit-log.dto';
import { JOB_NAMES } from '@/shared/constants/bull.constant';
import { AuditLogStatus } from '@/shared/enums/audit-log-status.enum';
import { sanitizeAuditPayload } from '@/utils/audit-log.util';
import { InjectQueue } from '@nestjs/bullmq';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { catchError, finalize, from, map, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    @InjectQueue('audit-log')
    private readonly auditLogQueue: Queue,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();
    const staff = req?.staff;
    const url = req.url;
    const method = req.method;
    const auditKey = `${staff?.id}-${Date.now()}`;

    const excludedPaths = ['tree', '/options', '/api/v1/audit-logs', '/location-regions/selection'];
    if (excludedPaths.some((path) => url.includes(path))) {
      return next.handle();
    }

    //
    if (staff) {
      const dataCreate = {
        //
        staffId: staff.id,
        username: staff.fullName,
        email: staff.email,
        phone: staff.phone,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        roles: staff.roles?.map((role) => role.name) || [],
        isSubAdmin: staff.isSubAdmin || false,
        isSuperAdmin: staff.isSuperAdmin || false,

        //
        desc: '',
        method,
        endpoint: url,
        statusCode: 0, // Tạm thời set 0
        requestPayload: JSON.stringify(sanitizeAuditPayload(req.body)),
        responsePayload: null, // Chưa có response tại thời điểm này
        status: AuditLogStatus.PENDING,
        keySession: auditKey,
      } as CreateAuditLogDto;

      //
      await this.auditLogQueue.add(JOB_NAMES.CREATE_AUDIT_LOG, dataCreate);
    }

    //
    this.logger.debug(` 📥 [AuditLogInterceptor] ${method} ${url}`);

    //
    return next.handle().pipe(
      switchMap((data) =>
        from(
          this.auditLogQueue.add(JOB_NAMES.UPDATE_AUDIT_LOG, {
            keySession: auditKey,
            updateAuditLogDto: {
              status: AuditLogStatus.SUCCESS,
              statusCode: (data?.statusCode as number) || 200,
              responsePayload: JSON.stringify(
                method !== 'GET' ? sanitizeAuditPayload(data) : { message: 'Response payload hidden for GET requests' },
              ),
              desc: data?.message || '',
            },
          }),
        ).pipe(map(() => data)),
      ),

      catchError((err) => {
        const responseError = err?.response;
        return from(
          this.auditLogQueue.add(JOB_NAMES.UPDATE_AUDIT_LOG, {
            keySession: auditKey,
            updateAuditLogDto: {
              status: AuditLogStatus.FAILURE,
              statusCode: (responseError?.statusCode as number) || 200,
              desc: (responseError?.message as string) || '',
            },
          }),
        ).pipe(switchMap(() => throwError(() => err)));
      }),

      finalize(() => {
        this.logger.debug(`📥 [AuditLogInterceptor] ${method} ${url} - FINALIZE`);
      }),
    );
  }
}
