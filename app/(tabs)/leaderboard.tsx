import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeaderboardStore } from '@/stores/leaderboard-store';
import { useAuthStore } from '@/stores/auth-store';
import { LeaderboardRow } from '@/components/leaderboard-row';
import { SkeletonLoader } from '@/components/skeleton-loader';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';

type LeaderboardTab = 'freunde' | 'weltweit';

const TABS: { key: LeaderboardTab; label: string }[] = [
  { key: 'freunde',  label: 'Freunde' },
  { key: 'weltweit', label: 'Weltweit' },
];

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'weekly',   label: 'Woche' },
  { key: 'monthly',  label: 'Monat' },
  { key: 'seasonal', label: 'Saison' },
  { key: 'alltime',  label: 'Gesamt' },
];

const FREE_LIMIT = 10;

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<LeaderboardTab>('freunde');

  const global    = useLeaderboardStore((s) => s.global);
  const friends   = useLeaderboardStore((s) => s.friends);
  const myRank    = useLeaderboardStore((s) => s.myRank);
  const period    = useLeaderboardStore((s) => s.period);
  const isLoading = useLeaderboardStore((s) => s.isLoading);
  const error     = useLeaderboardStore((s) => s.error);
  const refresh   = useLeaderboardStore((s) => s.refresh);
  const setPeriod = useLeaderboardStore((s) => s.setPeriod);

  const profile   = useAuthStore((s) => s.profile);
  const isPremium = profile?.isPremium ?? false;
  const myId      = profile?.id;

  useEffect(() => {
    refresh();
  }, []);

  const listData: LeaderboardEntry[] = tab === 'freunde' ? friends : global;

  const renderItem = useCallback(
    ({ item, index }: { item: LeaderboardEntry; index: number }) => {
      const isMe     = item.userId === myId;
      const isLocked = tab === 'weltweit' && !isPremium && index >= FREE_LIMIT;
      return <LeaderboardRow entry={item} isMe={isMe} isLocked={isLocked} />;
    },
    [myId, isPremium, tab],
  );

  const renderContent = () => {
    if (isLoading) return <SkeletonLoader count={8} />;

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

    if (listData.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="text-4xl mb-4">🏆</Text>
          <Text className="text-primary font-semibold">
            {tab === 'freunde' ? 'Noch keine Freunde' : 'Noch keine Einträge'}
          </Text>
          {tab === 'freunde' && (
            <Text className="text-muted text-sm mt-2 text-center px-8">
              Suche nach Freunden über ihren Benutzernamen.
            </Text>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={isLoading}
        contentContainerClassName="pb-6"
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={15}
        ItemSeparatorComponent={() => <View className="h-px bg-background mx-4" />}
        ListFooterComponent={
          tab === 'weltweit' && !isPremium && global.length > FREE_LIMIT ? (
            <View className="mx-4 mt-4 bg-surface rounded-2xl p-4 items-center">
              <Text className="text-accent font-bold mb-1">🔒 Premium freischalten</Text>
              <Text className="text-muted text-sm text-center">
                Sieh die komplette Weltrangliste mit einem Premium-Abo.
              </Text>
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-2 pb-3">
        <Text className="text-primary text-2xl font-bold">Rangliste</Text>
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-4 mb-3 bg-surface rounded-xl p-1">
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg items-center ${
              tab === t.key ? 'bg-accent' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                tab === t.key ? 'text-black' : 'text-muted'
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Period chips */}
      <View className="flex-row gap-2 px-4 mb-3">
        {PERIODS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-full ${
              period === p.key ? 'bg-accent' : 'bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                period === p.key ? 'text-black' : 'text-muted'
              }`}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderContent()}

      {/* Sticky own-rank row at bottom */}
      {myRank && tab === 'weltweit' && !isLoading && (
        <View className="border-t border-surface">
          <LeaderboardRow entry={myRank} isMe />
        </View>
      )}
    </SafeAreaView>
  );
}
