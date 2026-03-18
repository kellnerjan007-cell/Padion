import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface PaywallModalProps {
  title?: string;
  description?: string;
  onDismiss?: () => void;
}

export function PaywallModal({
  title = 'Premium Feature 🔒',
  description = 'Upgrade auf Premium für unbegrenzte Nutzung.',
  onDismiss,
}: PaywallModalProps) {
  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
    onDismiss?.();
  };

  return (
    <View className="mx-4 bg-surface rounded-2xl p-5 border border-accent">
      <Text className="text-primary font-bold text-base mb-1">{title}</Text>
      <Text className="text-muted text-sm mb-4">{description}</Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleUpgrade}
          className="flex-1 bg-accent rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-sm">Premium werden</Text>
        </Pressable>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            className="px-4 bg-background rounded-xl py-3 items-center active:opacity-70"
          >
            <Text className="text-muted text-sm">Später</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
