import { View, Text } from 'react-native';
import { useNetwork } from '@/hooks/use-network';

export function OfflineBanner() {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View className="bg-red-500 px-4 py-2 items-center">
      <Text className="text-white text-xs font-semibold">
        Keine Internetverbindung
      </Text>
    </View>
  );
}
