import { Injectable } from '@nestjs/common';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  model: ChatOllama;
  embeddings: OllamaEmbeddings;

  constructor(private readonly configService: ConfigService) {
    // Thêm cấu hình URL nếu Ollama chạy trên server khác (ví dụ: Docker, AI Server riêng)
    const ollamaHost = this.configService.get<string>('OLLAMA_HOST') || 'http://localhost:11434';

    //
    this.model = new ChatOllama({
      model: 'clidx/Qwen3-1.7B-Q8_0:think',
      baseUrl: ollamaHost,
    });

    //
    this.embeddings = new OllamaEmbeddings({
      model: 'qwen3-embedding:0.6b',
      baseUrl: ollamaHost,
      dimensions: 1024,
    });
  }
}
