import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  // POST /rag/ingest  (multipart/form-data, field name: "file")
  @Post('ingest')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async ingest(@UploadedFile() file: Express.Multer.File) {
    return this.ragService.ingestPdf(file.path, file.originalname);
  }

  // POST /rag/ask  { "question": "..." }
  @Post('ask')
  async ask(@Body() dto: AskQuestionDto) {
    return this.ragService.ask(dto.question);
  }
}
