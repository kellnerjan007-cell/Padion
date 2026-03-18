import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Text style={{ fontSize: 56 }} className="mb-4">{emoji}</Text>
      <Text className="text-primary font-bold text-lg text-center mb-2">{title}</Text>
      {subtitle && (
        <Text className="text-muted text-sm text-center leading-5">{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 bg-accent px-6 py-3 rounded-2xl active:opacity-80"
        >
          <Text className="text-black font-bold text-sm">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
