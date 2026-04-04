export interface IJwtPayload {
  userId: string;
  type: 'access' | 'refresh';
}
