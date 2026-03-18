import { Tabs } from "expo-router";
import type { ErrorBoundaryProps } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { useMatchStore } from "@/stores/match-store";
import { OfflineBanner } from "@/components/offline-banner";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <Text className="text-4xl mb-4">⚠️</Text>
      <Text className="text-primary font-bold text-lg mb-2 text-center">
        Etwas ist schiefgelaufen
      </Text>
      <Text className="text-muted text-sm text-center mb-6">
        {error.message}
      </Text>
      <Pressable
        onPress={retry}
        className="bg-accent px-6 py-3 rounded-xl active:opacity-80"
      >
        <Text className="text-black font-bold">Nochmal versuchen</Text>
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const liveCount = useMatchStore((s) => s.liveMatches.length);

  return (
    <>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0D0D1A",
            borderTopColor: "#1A1A2E",
          },
          tabBarActiveTintColor: "#E94560",
          tabBarInactiveTintColor: "#A0A0B0",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarBadge: liveCount > 0 ? liveCount : undefined,
            tabBarBadgeStyle: { backgroundColor: "#E94560" },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="predict"
          options={{
            title: "Predict",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Rangliste",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: "AI Coach",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
