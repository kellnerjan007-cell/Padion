import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth-service';
import type { Profile } from '@/types/profile';

interface AuthStore {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const session = await authService.getSession();
      set({ session });

      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ profile });
      }

      authService.onAuthStateChange(async (session) => {
        const s = session as Session | null;
        set({ session: s });

        if (s?.user) {
          const profile = await authService.getProfile(s.user.id);
          set({ profile });
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ error: 'Fehler beim Laden der Session' });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.signInWithApple();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Apple Sign-In fehlgeschlagen';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signInWithEmail(email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signUp(email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registrierung fehlgeschlagen';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.signOut();
      set({ session: null, profile: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Abmeldung fehlgeschlagen';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  clearError: () => set({ error: null }),
}));
