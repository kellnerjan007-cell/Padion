import { usePredictionStore } from '@/stores/prediction-store';
import { useAuthStore } from '@/stores/auth-store';

export function useDailyLimit() {
  const dailyCount = usePredictionStore((s) => s.dailyCount);
  const isAtDailyLimit = usePredictionStore((s) => s.isAtDailyLimit);
  const profile = useAuthStore((s) => s.profile);

  const isPremium = profile?.isPremium ?? false;

  return {
    dailyCount,
    isPremium,
    isAtLimit: isAtDailyLimit(isPremium),
  };
}
