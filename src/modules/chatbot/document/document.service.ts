import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentInternalEntity } from './entity/document-internal.entity';
import { DataSource, Repository } from 'typeorm';
import { DocumentPublicEntity } from './entity/document-public.entity';
import { DocumentStatus, DocumentType } from './document.type';
import { DocumentQueryDto } from './dto/query-document.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IngestDocumentDto } from './dto/ingest.dto';
import { promises as fs } from 'fs';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentInternalEntity)
    private documentInternalRepo: Repository<DocumentInternalEntity>,

    @InjectRepository(DocumentPublicEntity)
    private documentPublicRepo: Repository<DocumentPublicEntity>,

    private dataSource: DataSource,
  ) {}

  async create({ payload, status }: { payload: IngestDocumentDto; status: DocumentStatus }) {
    const { filename, originalname, fileSize, type, filePath } = payload;

    //
    if (type === 'internal') {
      const document = this.documentInternalRepo.create({ filename, fileSize, status, originalname, filePath });
      return this.documentInternalRepo.save(document);
    }

    //
    const document = this.documentPublicRepo.create({ filename, fileSize, status, originalname, filePath });
    return await this.documentPublicRepo.save(document);
  }

  async remove(id: string, type: DocumentType) {
    return this.dataSource.transaction(async (manager) => {
      if (type === 'internal') {
        await manager.query(
          `
        DELETE FROM document_internal_chunks
        WHERE metadata->>'documentId' = $1
        `,
          [id],
        );

        const document = await manager.findOne(DocumentInternalEntity, {
          where: { id },
        });

        if (document) {
          await manager.remove(document);
        }

        if (document?.filePath) {
          await this.removeFile(document.filePath);
        }

        return document;
      }

      if (type === 'public') {
        await manager.query(
          `
        DELETE FROM document_public_chunks
        WHERE metadata->>'documentId' = $1
        `,
          [id],
        );

        const document = await manager.findOne(DocumentPublicEntity, {
          where: { id },
        });

        if (document) {
          await manager.remove(document);
        }

        if (document?.filePath) {
          await this.removeFile(document.filePath);
        }

        return document;
      }
    });
  }

  async removeFile(filePath: string) {
    await fs.unlink(filePath).catch(() => {
      console.error('Error occurred while deleting file:', filePath);
    });
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

    //
    if (type === 'internal') {
      return await this.documentInternalRepo.find({ take, skip, order: { createdAt: 'DESC' } });
    }

    //
    const [documents, total] = await this.documentPublicRepo.findAndCount({ take, skip, order: { createdAt: 'DESC' } });

    //
    return {
      data: documents,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }
}
