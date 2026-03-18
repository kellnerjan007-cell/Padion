import { create } from 'zustand';
import { chatService } from '@/services/chat-service';
import type { ChatSession, ChatMessage } from '@/types/chat';

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  dailyCount: number;
  error: string | null;

  loadSessions: () => Promise<void>;
  startSession: () => Promise<string>;
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  setSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isTyping: false,
  dailyCount: 0,
  error: null,

  loadSessions: async () => {
    try {
      const sessions = await chatService.fetchSessions();
      set({ sessions });
    } catch {
      set({ error: 'Sessions konnten nicht geladen werden' });
    }
  },

  startSession: async () => {
    const session = await chatService.createSession();
    set((state) => ({ sessions: [session, ...state.sessions], currentSessionId: session.id, messages: [] }));
    return session.id;
  },

  setSession: (sessionId) => {
    set({ currentSessionId: sessionId, messages: [] });
    get().loadMessages(sessionId);
  },

  loadMessages: async (sessionId) => {
    try {
      const messages = await chatService.fetchMessages(sessionId);
      set({ messages });
    } catch {
      set({ error: 'Nachrichten konnten nicht geladen werden' });
    }
  },

  sendMessage: async (text) => {
    const sessionId = get().currentSessionId;
    if (!sessionId || !text.trim()) return;

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: text.trim(),
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isTyping: true,
      error: null,
    }));

    try {
      const reply = await chatService.sendMessage(sessionId, text.trim());
      set((state) => ({
        messages: [...state.messages, reply],
        isTyping: false,
        dailyCount: state.dailyCount + 1,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fehler beim Senden';
      set({ isTyping: false, error: msg });
    }
  },

  deleteSession: async (sessionId) => {
    await chatService.deleteSession(sessionId);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
      messages: state.currentSessionId === sessionId ? [] : state.messages,
    }));
  },

  clearError: () => set({ error: null }),
}));
