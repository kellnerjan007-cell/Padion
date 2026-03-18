import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import type { Profile } from '@/types/profile';
import { transformProfile } from '@/utils/transforms';

export const authService = {
  signInWithApple: async (): Promise<void> => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
    });

    if (error) throw error;
  },

  signInWithEmail: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return transformProfile(data);
  },

  setUsername: async (userId: string, username: string, displayName: string): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, username, display_name: displayName });
    if (error) throw error;
  },

  checkUsernameAvailable: async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    return data === null;
  },

  onAuthStateChange: (callback: (session: unknown) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription.unsubscribe;
  },
};
