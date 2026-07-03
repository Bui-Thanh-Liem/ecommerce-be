import { DocumentType } from '../document.type';

export class IngestDocumentDto {
  filePath: string;
  filename: string;
  fileSize: number;
  type: DocumentType;
  originalname: string;
}
