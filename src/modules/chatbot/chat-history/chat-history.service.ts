import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistoryEntity, ChatHistoryRole } from './entity/chat-history.entity';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistoryEntity)
    private readonly chatHistoryRepository: Repository<ChatHistoryEntity>,
  ) {}

  async getRecentMessages(conversationId: string, limit = 12): Promise<BaseMessage[]> {
    const rows = await this.chatHistoryRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
      select: {
        role: true,
        content: true,
      },
    });

    return rows
      .reverse()
      .map((r) => (r.role === ChatHistoryRole.HUMAN ? new HumanMessage(r.content) : new AIMessage(r.content)));
  }

  async appendHuman(conversationId: string, content: string): Promise<void> {
    await this.chatHistoryRepository.insert({
      conversationId,
      role: ChatHistoryRole.HUMAN,
      content,
    });
  }

  async appendAi(conversationId: string, content: string): Promise<void> {
    await this.chatHistoryRepository.insert({
      conversationId,
      role: ChatHistoryRole.AI,
      content,
    });
  }

  async appendMessage(params: { conversationId: string; role: ChatHistoryRole; content: string }): Promise<void> {
    const { conversationId, role, content } = params;
    await this.chatHistoryRepository.insert({
      conversationId,
      role,
      content,
    });
  }
}
