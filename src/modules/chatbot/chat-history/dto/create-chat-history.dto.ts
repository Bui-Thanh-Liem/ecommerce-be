import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChatHistoryRole } from '../entity/chat-history.entity';

export class CreateChatHistoryDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(ChatHistoryRole)
  @IsNotEmpty()
  role: ChatHistoryRole;

  @IsString()
  @IsNotEmpty()
  content: string;
}
