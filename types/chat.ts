export type ChatRole = 'user' | 'assistant';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  tokensUsed: number;
  createdAt: string;
}
