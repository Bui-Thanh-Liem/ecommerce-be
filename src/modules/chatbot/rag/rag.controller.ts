/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Body,
  Controller,
  Post,
  Sse,
  UploadedFile,
  UseInterceptors,
  MessageEvent,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { Public } from '@/decorators/public.decorator';
import { Observable } from 'rxjs/internal/Observable';
import { type DocumentType } from '../document/document.type';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { DocumentDto } from '../document/dto/document.dto';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { IngestVariantDto } from './dto/ingest-variant.dto';
import { CurrentStaff } from '@/decorators/current-staff.decorator';
import { StaffEntity } from '@/modules/management/staffs/entities/staff.entity';
import { CurrentCustomer } from '@/decorators/current-customer.decorator';
import { CustomerEntity } from '@/modules/customer/customers/entities/customer.entity';
import { type IInfoGuest } from '@/shared/interfaces/common/info-guest';
import { GetInfoGuest } from '@/decorators/get-info-guest.decorator';
import { DocumentService } from '../document/document.service';

/**
 * RAG: Retrieval-Augmented Generation
 * Retrieval-Augmented (tìm kiếm tăng cường) -> tìm kiếm thông tin từ các nguồn dữ liệu đã được lưu trữ trong hệ thống.
 * Generation (tạo ra câu trả lời) để tạo ra câu trả lời dựa trên dữ liệu đã được lưu trữ trong hệ thống.
 */
@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly documentService: DocumentService,
  ) {}

  @Post('ingest-document/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // Giới hạn file upload tối đa 10MB
        fieldNameSize: 50, // Giới hạn độ dài tên trường (field name) tối đa 50 ký tự
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/csv',
        ];
        const allowedExtensions = /\.(pdf|txt|docx|csv)$/i;
        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, TXT, DOCX, or CSV formats are supported.'), false);
        }
      },
    }),
  )
  @Serializer(DocumentDto)
  async ingestDocument(@Param('type') type: DocumentType, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!['public', 'internal'].includes(type)) {
        throw new BadRequestException('Invalid document type');
      }

      return await this.ragService.ingestDocument({
        type,
        filePath: file.path,
        fileSize: file.size,
        filename: file.filename, // Tên file đã được lưu trên server (có thể khác với tên gốc)
        originalname: file.originalname,
      });
    } catch (error) {
      if (file?.path) {
        await this.documentService.removeFile(file.path);
      }
      throw error;
    }
  }

  @Post('ingest-variant/:type')
  @Serializer(ProductVariantSKUDto)
  async ingestProductVariant(@Param('type') type: string, @Body() variant: IngestVariantDto) {
    return await this.ragService.ingestProductVariant(variant, type as DocumentType);
  }

  @Public()
  @Sse('ask/:type')
  ask(
    @Query('question') question: string,
    @Param('type') type: DocumentType,
    @GetInfoGuest() guest: IInfoGuest,
    @CurrentStaff() staff: StaffEntity,
    @CurrentCustomer() customer: CustomerEntity,
  ): Observable<MessageEvent> {
    //
    console.log('staff?.id', staff?.id);
    console.log('customer?.id', customer?.id);
    console.log('guest?.session', guest?.session);

    const conversationId = staff?.id || customer?.id || guest?.session;
    if (!conversationId) {
      throw new BadRequestException('No valid conversation ID found');
    }

    //
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          const responseStream = await this.ragService.ask(question, type, conversationId);
          for await (const chunk of responseStream) {
            subscriber.next({ data: chunk });
          }
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }

  @Public()
  @Post('test')
  async test() {
    return this.ragService.test();
  }
}
