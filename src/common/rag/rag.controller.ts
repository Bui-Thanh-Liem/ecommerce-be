import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  // POST /rag/ingest  (multipart/form-data, field name: "file")
  @Public()
  @Post('ingest')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads', limits: { fileSize: 10 * 1024 * 1024 } })) // Giới hạn file upload tối đa 10MB
  async ingest(@UploadedFile() file: Express.Multer.File) {
    return this.ragService.ingestPdf(file.path, file.originalname);
  }

  // POST /rag/ask  { "question": "..." }
  @Public()
  @Post('ask')
  async ask(@Body() dto: AskQuestionDto) {
    return this.ragService.ask(dto.question);
  }

  // POST /rag/ask-advanced  { "question": "..." }
  @Public()
  @Post('ask-advanced')
  async askAdvanced(@Body() dto: AskQuestionDto) {
    return this.ragService.askAdvanced(dto.question, { userId: 'anonymous', role: 'customer' });
  }

  @Public()
  @Post('test')
  async test() {
    return this.ragService.test();
  }
}
