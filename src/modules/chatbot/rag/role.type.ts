export interface UserContext {
  userId: string;
  type: DocumentType;
}

export interface RAGDocument {
  content: string;
  metadata: Record<string, any>;
  score?: number;
}
