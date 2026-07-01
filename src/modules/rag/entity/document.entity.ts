import { BaseEntity } from '@/shared/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { type DocumentStatus } from './product.entity';

// Bảng này CHỈ lưu thông tin quản lý (tên file, trạng thái, số chunk),
// KHÔNG lưu vector. Vector embedding nằm ở bảng riêng "document_chunks"
// do LangChain PGVectorStore tự tạo và quản lý (xem vector-store.provider.ts).
@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @Column()
  filename: string;

  @Column({ type: 'varchar', default: 'processing' })
  status: DocumentStatus;

  @Column({ type: 'int', default: 0 })
  chunkCount: number;

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công Document có filename: ${this.filename}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật Document có filename: ${this.filename}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa Document có filename: ${this.filename}`);
  }
}
