import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentInternalEntity } from './entity/document-internal.entity';
import { Repository } from 'typeorm';
import { DocumentPublicEntity } from './entity/document-public.entity';
import { DocumentStatus, DocumentType } from './document.type';
import { DocumentQueryDto } from './dto/query-document.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentInternalEntity)
    private documentInternalRepo: Repository<DocumentInternalEntity>,

    @InjectRepository(DocumentPublicEntity)
    private documentPublicRepo: Repository<DocumentPublicEntity>,
  ) {}

  async create(filename: string, status: DocumentStatus, type: DocumentType) {
    //
    if (type === 'internal') {
      const document = this.documentInternalRepo.create({ filename, status });
      return this.documentInternalRepo.save(document);
    }

    //
    const document = this.documentPublicRepo.create({ filename, status });
    return await this.documentPublicRepo.save(document);
  }

  async changeStatus(id: string, payload: { status: DocumentStatus; chunkCount?: number }, type: DocumentType) {
    if (type === 'internal') {
      const document = await this.documentInternalRepo.findOne({ where: { id } });
      if (document) {
        document.status = payload.status;
        if (payload.chunkCount !== undefined) {
          document.chunkCount = payload.chunkCount;
        }
        return await this.documentInternalRepo.save(document);
      }
    } else {
      const document = await this.documentPublicRepo.findOne({ where: { id } });
      if (document) {
        document.status = payload.status;
        if (payload.chunkCount !== undefined) {
          document.chunkCount = payload.chunkCount;
        }
        return await this.documentPublicRepo.save(document);
      }
    }
  }

  async getDocumentsByType(type: DocumentType, queries: DocumentQueryDto) {
    const { page, limit } = queries;
    const { take, skip } = calculatePagination(page, limit);

    if (type === 'internal') {
      return await this.documentInternalRepo.find({ take, skip, order: { createdAt: 'DESC' } });
    }
    return await this.documentPublicRepo.find({ take, skip, order: { createdAt: 'DESC' } });
  }
}
