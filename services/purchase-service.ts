import { supabase } from './supabase';

// RevenueCat API Key – set this once you have your Apple Developer Account
// and have created products in App Store Connect + RevenueCat dashboard
const REVENUECAT_API_KEY = ''; // TODO: 'appl_...' after Apple Developer Account setup

export interface Offering {
  monthly: { productId: string; price: string; pricePerMonth: string } | null;
  yearly:  { productId: string; price: string; pricePerMonth: string; savingsPercent: number } | null;
}

export const purchaseService = {
  isConfigured: () => REVENUECAT_API_KEY !== '',

  configure: async (): Promise<void> => {
    if (!purchaseService.isConfigured()) return;
    // Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  },

  fetchOfferings: async (): Promise<Offering> => {
    // Real implementation once RevenueCat is set up:
    // const offerings = await Purchases.getOfferings();
    // return parseOfferings(offerings.current);

    // Placeholder prices shown in UI
    return {
      monthly: {
        productId: 'padion.premium.monthly',
        price: 'CHF 4.90',
        pricePerMonth: 'CHF 4.90',
      },
      yearly: {
        productId: 'padion.premium.yearly',
        price: 'CHF 39.90',
        pricePerMonth: 'CHF 3.33',
        savingsPercent: 32,
      },
    };
  },

  purchaseMonthly: async (): Promise<void> => {
    if (!purchaseService.isConfigured()) {
      throw new Error('NOT_CONFIGURED');
    }
    // const { customerInfo } = await Purchases.purchaseProduct('padion.premium.monthly');
    // await purchaseService.syncWithSupabase(customerInfo);
  },

  purchaseYearly: async (): Promise<void> => {
    if (!purchaseService.isConfigured()) {
      throw new Error('NOT_CONFIGURED');
    }
    // const { customerInfo } = await Purchases.purchaseProduct('padion.premium.yearly');
    // await purchaseService.syncWithSupabase(customerInfo);
  },

  restorePurchases: async (): Promise<boolean> => {
    if (!purchaseService.isConfigured()) return false;
    // const customerInfo = await Purchases.restorePurchases();
    // return customerInfo.activeSubscriptions.length > 0;
    return false;
  },

  checkStatus: async (): Promise<boolean> => {
    if (!purchaseService.isConfigured()) return false;
    // const customerInfo = await Purchases.getCustomerInfo();
    // return Object.keys(customerInfo.entitlements.active).length > 0;
    return false;
  },

  syncWithSupabase: async (isPremium: boolean): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ is_premium: isPremium })
      .eq('id', user.id);
  },
};
