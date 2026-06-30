/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Body, Controller, Post, Sse, UploadedFile, UseInterceptors, MessageEvent } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { Public } from '@/decorators/public.decorator';
import { Observable } from 'rxjs/internal/Observable';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Public()
  @Post('ingest')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads', limits: { fileSize: 10 * 1024 * 1024 } })) // Giới hạn file upload tối đa 10MB
  async ingest(@UploadedFile() file: Express.Multer.File) {
    return this.ragService.ingestPdf(file.path, file.originalname);
  }

  @Public()
  @Sse('ask')
  ask(@Body() dto: AskQuestionDto): Observable<MessageEvent> {
    const question = dto.question;
    const userType: 'CUSTOMER' | 'INTERNAL' = 'CUSTOMER';

    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          const responseStream = await this.ragService.ask(question, userType);
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
