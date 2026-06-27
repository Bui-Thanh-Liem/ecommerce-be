import { Controller, Post, Body, Header, Res } from '@nestjs/common';
import { type Response } from 'express';
import { GeminiRagService } from '@/common/gemini-rag/gemini-rag.service';
import { ProductVariantsService } from '@/modules/catalog/product-variants-SKU/product-variants.service';
import { Public } from '@/decorators/public.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly geminiRagService: GeminiRagService,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Public()
  @Post('chat')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async streamChat(@Body('question') question: string, @Res() res: Response) {
    try {
      // Bước 1: Trả về chunk "Đang suy nghĩ"
      res.write(
        `data: ${JSON.stringify({
          type: 'thinking',
          content: 'Đang tìm kiếm sản phẩm phù hợp...',
        })}\n\n`,
      );

      const matchedProducts = await this.productVariantsService.findSimilarProductEmbeddings(question, 5);

      // Bước 3: Trả về Sources
      res.write(
        `data: ${JSON.stringify({
          type: 'sources',
          content: 'Sản phẩm tham chiếu:',
          data: matchedProducts.map((pv, i) => ({
            rank: i + 1,
            name: pv.product?.name,
            sku: pv.sku,
            price: pv.price,
          })),
        })}\n\n`,
      );

      // Bước 4: Stream câu trả lời từ Gemini
      res.write(`data: ${JSON.stringify({ type: 'start_answer' })}\n\n`);

      for await (const chunk of this.geminiRagService.generateChatbotResponseStream(question, matchedProducts)) {
        res.write(
          `data: ${JSON.stringify({
            type: 'answer_chunk',
            content: chunk,
          })}\n\n`,
        );
      }

      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      res.end();
    } catch (error) {
      console.error(error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          content: 'Có lỗi xảy ra, vui lòng thử lại sau.',
        })}\n\n`,
      );
      res.end();
    }
  }
}
