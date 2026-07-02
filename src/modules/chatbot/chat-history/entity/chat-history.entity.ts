import { BaseEntity } from '@/shared/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum ChatHistoryRole {
  HUMAN = 'human',
  AI = 'ai',
}

@Entity('chat_histories')
export class ChatHistoryEntity extends BaseEntity {
  @Index()
  @Column({ type: 'varchar' })
  conversationId: string;

  @Column({ type: 'varchar', length: 10 })
  role: ChatHistoryRole;

  @Column({ type: 'text' })
  content: string;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Role có role: ${this.role}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công Role có role: ${this.role}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công Role có role: ${this.role}`);
  }
}
