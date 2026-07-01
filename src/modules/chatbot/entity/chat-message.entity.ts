import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type ChatMessageRole = 'human' | 'ai';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mỗi conversationId đại diện cho 1 phiên chat (1 tab widget, 1 khách hàng...)
  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'varchar', length: 10 })
  role: ChatMessageRole;

  @Column({ type: 'text' })
  content: string;

  // Optional: biết message này thuộc luồng public hay internal
  @Column({ type: 'varchar', length: 20, nullable: true })
  documentType?: string;

  @CreateDateColumn()
  createdAt: Date;
}
