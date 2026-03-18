import { create } from 'zustand';
import { purchaseService, type Offering } from '@/services/purchase-service';

interface PurchaseStore {
  isPremium: boolean;
  offering: Offering | null;
  isLoading: boolean;
  error: string | null;

  loadOffering: () => Promise<void>;
  purchaseMonthly: () => Promise<void>;
  purchaseYearly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  clearError: () => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  isPremium: false,
  offering: null,
  isLoading: false,
  error: null,

  loadOffering: async () => {
    try {
      const offering = await purchaseService.fetchOfferings();
      set({ offering });
    } catch {
      // silent – use fallback prices
    }
  },

  purchaseMonthly: async () => {
    set({ isLoading: true, error: null });
    try {
      await purchaseService.purchaseMonthly();
      await purchaseService.syncWithSupabase(true);
      set({ isPremium: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Kauf fehlgeschlagen';
      if (msg !== 'NOT_CONFIGURED') set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseYearly: async () => {
    set({ isLoading: true, error: null });
    try {
      await purchaseService.purchaseYearly();
      await purchaseService.syncWithSupabase(true);
      set({ isPremium: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Kauf fehlgeschlagen';
      if (msg !== 'NOT_CONFIGURED') set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true, error: null });
    try {
      const restored = await purchaseService.restorePurchases();
      if (restored) {
        await purchaseService.syncWithSupabase(true);
        set({ isPremium: true });
      } else {
        set({ error: 'Kein aktives Abo gefunden' });
      }
    } catch {
      set({ error: 'Wiederherstellen fehlgeschlagen' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
