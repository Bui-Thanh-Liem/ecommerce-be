import { Trim } from '@/decorators/trim.decorator';
import { AuditLogStatus } from '@/shared/enums/audit-log-status.enum';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
  @IsNotEmpty()
  @IsUUID('4')
  staffId: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(50)
  username: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  email: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  @MaxLength(45)
  ipAddress: string;

  @IsString()
  @MaxLength(255)
  userAgent: string;

  @IsString()
  @MaxLength(10)
  method: string;

  @IsString()
  @MaxLength(255)
  endpoint: string;

  @IsString()
  @MaxLength(255)
  desc: string;

  @IsString()
  @MaxLength(10)
  statusCode: number;

  @IsOptional()
  @IsObject()
  requestPayload: any;

  @IsOptional()
  @IsObject()
  responsePayload: any;

  @IsNotEmpty()
  @IsEnum(AuditLogStatus)
  status: AuditLogStatus;

  @IsNotEmpty()
  @Trim()
  @IsString()
  keySession: string;
}
