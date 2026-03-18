import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { tournamentService } from '@/services/tournament-service';
import { matchService } from '@/services/match-service';
import { MatchCard } from '@/components/match-card';
import { SkeletonLoader } from '@/components/skeleton-loader';
import type { Tournament } from '@/types/tournament';
import type { Match } from '@/types/match';

type TournamentTab = 'spielplan' | 'ergebnisse';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  major: { bg: 'bg-yellow-500', text: 'text-black', label: 'MAJOR' },
  p1:    { bg: 'bg-accent',     text: 'text-black', label: 'P1' },
  p2:    { bg: 'bg-secondary',  text: 'text-primary', label: 'P2' },
};

const STATUS_LABELS: Record<string, string> = {
  upcoming:  'Demnächst',
  live:      'Live',
  completed: 'Abgeschlossen',
};

function flagEmoji(country: string): string {
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  return `${s.toLocaleDateString('de-CH', opts)} – ${e.toLocaleDateString('de-CH', { ...opts, year: 'numeric' })}`;
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TournamentTab>('spielplan');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      tournamentService.fetchTournamentById(id),
      matchService.fetchMatchesByTournament(id),
    ])
      .then(([t, m]) => {
        setTournament(t);
        setMatches(m);
      })
      .catch(() => setError('Turnier konnte nicht geladen werden'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const upcoming = matches.filter((m) => m.status === 'upcoming' || m.status === 'live');
  const results  = matches.filter((m) => m.status === 'completed');
  const listData = activeTab === 'spielplan' ? upcoming : results;

  const renderMatch = useCallback(
    ({ item }: { item: Match }) => <MatchCard match={item} />,
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="text-accent text-base">‹ Zurück</Text>
          </Pressable>
        </View>
        <SkeletonLoader count={5} />
      </SafeAreaView>
    );
  }

  if (error || !tournament) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted mb-4">{error ?? 'Turnier nicht gefunden'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Zurück</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cat = CATEGORY_STYLES[tournament.category] ?? CATEGORY_STYLES.p2;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Nav */}
      <View className="px-4 pt-2 pb-1">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Text className="text-accent text-base">‹ Zurück</Text>
        </Pressable>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerClassName="pt-2 pb-10"
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-4xl mb-4">🎾</Text>
            <Text className="text-primary font-semibold">
              {activeTab === 'spielplan' ? 'Keine anstehenden Matches' : 'Noch keine Ergebnisse'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Header Card */}
            <View className="mx-4 bg-surface rounded-2xl p-5 mb-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-primary font-bold text-xl">{tournament.name}</Text>
                  <Text className="text-muted text-sm mt-0.5">
                    {flagEmoji(tournament.country)} {tournament.location}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${cat.bg}`}>
                  <Text className={`font-bold text-xs ${cat.text}`}>{cat.label}</Text>
                </View>
              </View>

              {/* Info grid */}
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Datum</Text>
                  <Text className="text-primary text-sm font-semibold">
                    {formatDateRange(tournament.startDate, tournament.endDate)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Status</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      tournament.status === 'live' ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {STATUS_LABELS[tournament.status] ?? tournament.status}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Belag</Text>
                  <Text className="text-primary text-sm font-semibold capitalize">
                    {tournament.surface}
                  </Text>
                </View>
                {tournament.prizeMoney && (
                  <View className="flex-row justify-between">
                    <Text className="text-muted text-sm">Preisgeld</Text>
                    <Text className="text-accent text-sm font-bold">{tournament.prizeMoney}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Segmented Control */}
            <View className="flex-row mx-4 mb-2 bg-surface rounded-xl p-1">
              {(['spielplan', 'ergebnisse'] as TournamentTab[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    activeTab === tab ? 'bg-accent' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      activeTab === tab ? 'text-black' : 'text-muted'
                    }`}
                  >
                    {tab === 'spielplan' ? 'Spielplan' : 'Ergebnisse'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}
