import { supabase } from './supabase';
import type { ChatSession, ChatMessage } from '@/types/chat';
import { transformChatSession, transformChatMessage } from '@/utils/transforms';

export const chatService = {
  createSession: async (title = 'Neue Unterhaltung'): Promise<ChatSession> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht eingeloggt');

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;
    return transformChatSession(data);
  },

  fetchSessions: async (): Promise<ChatSession[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(transformChatSession);
  },

  fetchMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(transformChatMessage);
  },

  sendMessage: async (sessionId: string, message: string): Promise<ChatMessage> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Nicht eingeloggt');

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { session_id: sessionId, message },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    if (data?.error === 'DAILY_LIMIT_REACHED') {
      throw new Error('DAILY_LIMIT_REACHED');
    }

    return transformChatMessage(data.message);
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },
};
