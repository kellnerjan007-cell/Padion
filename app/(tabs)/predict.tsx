import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePredictionStore } from '@/stores/prediction-store';
import { CountdownTimer } from '@/components/countdown-timer';
import { PredictionSheet } from '@/components/prediction-sheet';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { MAX_FREE_PREDICTIONS } from '@/utils/constants';
import type { Match } from '@/types/match';

function flagEmoji(country: string): string {
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

const ROUND_LABELS: Record<string, string> = {
  final: 'F',
  semifinal: 'SF',
  quarterfinal: 'QF',
  'round-of-16': 'R16',
  'round-of-32': 'R32',
};

export default function PredictScreen() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const upcomingMatches = usePredictionStore((s) => s.upcomingMatches);
  const myPredictions = usePredictionStore((s) => s.myPredictions);
  const isLoading = usePredictionStore((s) => s.isLoading);
  const error = usePredictionStore((s) => s.error);
  const refresh = usePredictionStore((s) => s.refresh);
  const hasPredicted = usePredictionStore((s) => s.hasPredicted);

  const { dailyCount, isPremium, isAtLimit } = useDailyLimit();

  useEffect(() => {
    refresh();
  }, []);

  const handleMatchPress = useCallback(
    (match: Match) => {
      if (hasPredicted(match.id) || isAtLimit) return;
      setSelectedMatch(match);
    },
    [hasPredicted, isAtLimit],
  );

  const handleSheetClose = useCallback(() => {
    setSelectedMatch(null);
    refresh();
  }, [refresh]);

  const renderUpcomingItem = useCallback(
    ({ item }: { item: Match }) => {
      const predicted = hasPredicted(item.id);
      const locked = isAtLimit && !predicted;
      const roundLabel = ROUND_LABELS[item.round.toLowerCase()] ?? item.round.toUpperCase();

      return (
        <Pressable
          onPress={() => handleMatchPress(item)}
          disabled={predicted || locked}
          className={`bg-surface rounded-2xl p-4 mb-3 mx-4 ${
            predicted || locked ? 'opacity-50' : 'active:opacity-80'
          }`}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-base">{flagEmoji(item.team1Player1.country)}</Text>
                <Text className="text-primary font-semibold text-sm" numberOfLines={1}>
                  {item.team1Player1.name} / {item.team1Player2.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-base">{flagEmoji(item.team2Player1.country)}</Text>
                <Text className="text-primary font-semibold text-sm" numberOfLines={1}>
                  {item.team2Player1.name} / {item.team2Player2.name}
                </Text>
              </View>
            </View>

            <View className="items-end gap-1">
              <CountdownTimer scheduledAt={item.scheduledAt} className="text-muted text-xs" />
              {predicted ? (
                <View className="bg-accent px-2 py-0.5 rounded-lg">
                  <Text className="text-black text-xs font-bold">✓ Getippt</Text>
                </View>
              ) : locked ? (
                <Text className="text-muted text-xs">🔒</Text>
              ) : (
                <View className="bg-secondary px-2 py-0.5 rounded">
                  <Text className="text-primary text-xs font-bold">{roundLabel}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-2 pt-2 border-t border-background">
            <Text className="text-muted text-xs">{item.tournament?.name ?? ''}</Text>
          </View>
        </Pressable>
      );
    },
    [hasPredicted, isAtLimit, handleMatchPress],
  );

  const renderContent = () => {
    if (isLoading) return <SkeletonLoader count={4} />;

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

    return (
      <FlatList
        data={upcomingMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderUpcomingItem}
        onRefresh={refresh}
        refreshing={isLoading}
        contentContainerClassName="pt-2 pb-6"
        windowSize={10}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-4xl mb-4">🏆</Text>
            <Text className="text-primary font-semibold">Keine Matches zum Tippen</Text>
            <Text className="text-muted text-sm mt-2 text-center px-8">
              Schau zurück wenn neue Spiele anstehen.
            </Text>
          </View>
        }
        ListFooterComponent={
          myPredictions.length > 0 ? (
            <View className="px-4 mt-4">
              <Text className="text-primary font-bold text-base mb-3">Meine Tipps</Text>
              {myPredictions.slice(0, 5).map((p) => (
                <View
                  key={p.id}
                  className="bg-surface rounded-xl p-3 mb-2 flex-row justify-between items-center"
                >
                  <Text className="text-muted text-sm flex-1" numberOfLines={1}>
                    Tipp #{p.id.slice(-4)}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {p.pointsEarned > 0 && (
                      <Text className="text-accent font-bold text-sm">+{p.pointsEarned}</Text>
                    )}
                    <View
                      className={`px-2 py-0.5 rounded ${
                        p.status === 'correct'
                          ? 'bg-green-500'
                          : p.status === 'partial'
                          ? 'bg-yellow-500'
                          : p.status === 'wrong'
                          ? 'bg-red-500'
                          : 'bg-secondary'
                      }`}
                    >
                      <Text className="text-xs font-bold text-white">
                        {p.status === 'correct'
                          ? '✓'
                          : p.status === 'partial'
                          ? '~'
                          : p.status === 'wrong'
                          ? '✗'
                          : '…'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header */}
        <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
          <Text className="text-primary text-2xl font-bold">Tippen</Text>
          {!isPremium && (
            <View className="bg-surface px-3 py-1 rounded-full flex-row items-center gap-2">
              <Text className="text-accent font-bold text-sm">
                {dailyCount}/{MAX_FREE_PREDICTIONS}
              </Text>
              <Text className="text-muted text-xs">heute</Text>
            </View>
          )}
        </View>

        {/* Limit banner */}
        {isAtLimit && !isPremium && (
          <View className="mx-4 mb-3 bg-surface border border-accent rounded-xl p-3">
            <Text className="text-accent font-bold text-sm mb-0.5">Tageslimit erreicht 🔒</Text>
            <Text className="text-muted text-xs">
              Upgrade auf Premium für unbegrenzte Tipps.
            </Text>
          </View>
        )}

        {renderContent()}

        {selectedMatch && (
          <PredictionSheet match={selectedMatch} onClose={handleSheetClose} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
