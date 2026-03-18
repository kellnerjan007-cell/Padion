import '../global.css';
import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!profile) {
    return <Redirect href="/(auth)/username" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
