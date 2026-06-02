import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { AuditLogDto } from './dto/audit-log.dto';
import { AuditLogMetadataDto } from './dto/metadata-audit-log.dto';
import { AuditLogQueryDto } from './dto/query-audit-log.dto';

@Controller('audit-logs')
@Serializer(AuditLogDto)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  async create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return await this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  @Serializer(AuditLogMetadataDto)
  async findAll(@Query() query: AuditLogQueryDto) {
    return await this.auditLogsService.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return await this.auditLogsService.update(id, updateAuditLogDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.auditLogsService.remove(id);
  }
}
