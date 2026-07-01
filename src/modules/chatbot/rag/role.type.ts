export type Role = 'customer' | 'staff' | 'subAdmin' | 'admin';

export interface UserContext {
  userId: string;
  role: Role;
}

export interface RAGDocument {
  content: string;
  metadata: Record<string, any>;
  score?: number;
}
