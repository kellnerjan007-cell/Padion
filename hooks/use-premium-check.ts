import { useAuthStore } from '@/stores/auth-store';
import { usePurchaseStore } from '@/stores/purchase-store';

interface PremiumCheck {
  isPremium: boolean;
  isConfigured: boolean;
}

export function usePremiumCheck(): PremiumCheck {
  const profilePremium  = useAuthStore((s) => s.profile?.isPremium ?? false);
  const storePremium    = usePurchaseStore((s) => s.isPremium);
  const isPremium       = profilePremium || storePremium;

  return {
    isPremium,
    isConfigured: false, // set to true after Apple Developer Account setup
  };
}
