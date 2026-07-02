import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistoryEntity } from './entity/chat-history.entity';
import { ChatHistoryService } from './chat-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatHistoryEntity])],
  controllers: [],
  providers: [ChatHistoryService],
  exports: [ChatHistoryService],
})
export class ChatHistoryModule {}
