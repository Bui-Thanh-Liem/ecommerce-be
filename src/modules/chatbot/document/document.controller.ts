import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { type DocumentType } from './document.type';
import { DocumentService } from './document.service';
import { DocumentQueryDto } from './dto/query-document.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { DocumentDto } from './dto/document.dto';
import { DocumentMetadataDto } from './dto/metadata-document.dto';

@Controller('chatbot-document')
@Serializer(DocumentDto)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/:type')
  @Serializer(DocumentMetadataDto)
  async getDocumentsByType(@Query() queries: DocumentQueryDto, @Param('type') type: DocumentType) {
    return await this.documentService.getDocumentsByType(type, queries);
  }

  @Delete('/:type/:id')
  async removeDocument(@Param('id') id: string, @Param('type') type: DocumentType) {
    return await this.documentService.remove(id, type);
  }
}
