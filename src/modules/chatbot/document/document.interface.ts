import { IBase } from '@/shared/interfaces/common/base.interface';
import { DocumentStatus } from './document.type';

export interface IDocument extends IBase {
  originalname: string;
  filename: string;
  filePath: string;
  fileSize: number;
  status: DocumentStatus;
  chunkCount: number;
}
