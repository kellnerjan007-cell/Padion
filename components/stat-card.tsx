import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, suffix, highlight }: StatCardProps) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
      <Text className={`text-2xl font-bold ${highlight ? 'text-accent' : 'text-primary'}`}>
        {value}
        {suffix && <Text className="text-base font-normal">{suffix}</Text>}
      </Text>
      <Text className="text-muted text-xs mt-1 text-center">{label}</Text>
    </View>
  );
}
