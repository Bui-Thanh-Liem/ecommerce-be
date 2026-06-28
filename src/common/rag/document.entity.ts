import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type DocumentStatus = 'processing' | 'ready' | 'failed';

// Bảng này CHỈ lưu thông tin quản lý (tên file, trạng thái, số chunk),
// KHÔNG lưu vector. Vector embedding nằm ở bảng riêng "document_chunks"
// do LangChain PGVectorStore tự tạo và quản lý (xem vector-store.provider.ts).
@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ type: 'varchar', default: 'processing' })
  status: DocumentStatus;

  @Column({ type: 'int', default: 0 })
  chunkCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
