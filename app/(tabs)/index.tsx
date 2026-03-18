import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '@/stores/match-store';
import { MatchCard } from '@/components/match-card';
import { TournamentCard } from '@/components/tournament-card';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { useRealtimeMatches } from '@/hooks/use-realtime-matches';

type HomeTab = 'live' | 'resultate' | 'saison';

const TABS: { key: HomeTab; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'resultate', label: 'Resultate' },
  { key: 'saison', label: 'Saison' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<HomeTab>('live');

  const liveMatches = useMatchStore((s) => s.liveMatches);
  const recentResults = useMatchStore((s) => s.recentResults);
  const tournaments = useMatchStore((s) => s.tournaments);
  const isLoading = useMatchStore((s) => s.isLoading);
  const error = useMatchStore((s) => s.error);
  const refresh = useMatchStore((s) => s.refresh);
  useRealtimeMatches();

  useEffect(() => {
    refresh();
  }, []);

  const renderContent = () => {
    if (isLoading) return <SkeletonLoader count={5} />;

    if (error) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">{error}</Text>
          <Pressable onPress={refresh} className="mt-4">
            <Text className="text-accent font-semibold">Nochmal versuchen</Text>
          </Pressable>
        </View>
      );
    }

    if (activeTab === 'live') {
      if (liveMatches.length === 0) {
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-4">🎾</Text>
            <Text className="text-primary font-semibold">Keine Live-Matches</Text>
            <Text className="text-muted text-sm mt-2">Schau später nochmal rein.</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={liveMatches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          onRefresh={refresh}
          refreshing={isLoading}
          contentContainerClassName="pt-2 pb-6"
          windowSize={10}
          maxToRenderPerBatch={5}
          initialNumToRender={10}
        />
      );
    }

    if (activeTab === 'resultate') {
      if (recentResults.length === 0) {
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-base">Noch keine Resultate</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={recentResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          onRefresh={refresh}
          refreshing={isLoading}
          contentContainerClassName="pt-2 pb-6"
          windowSize={10}
          maxToRenderPerBatch={5}
          initialNumToRender={10}
        />
      );
    }

    if (tournaments.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Keine Turniere gefunden</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
        onRefresh={refresh}
        refreshing={isLoading}
        contentContainerClassName="pt-2 pb-6"
        windowSize={10}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <Text className="text-primary text-2xl font-bold">Padion</Text>
      </View>

      {/* Segmented Control */}
      <View className="flex-row mx-4 mb-2 bg-surface rounded-xl p-1">
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === tab.key ? 'bg-accent' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? 'text-primary' : 'text-muted'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}
