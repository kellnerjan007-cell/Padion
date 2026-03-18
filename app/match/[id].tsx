import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { matchService } from '@/services/match-service';
import { PredictionSheet } from '@/components/prediction-sheet';
import { LiveIndicator } from '@/components/live-indicator';
import { CountdownTimer } from '@/components/countdown-timer';
import { usePredictionStore } from '@/stores/prediction-store';
import type { Match } from '@/types/match';

function flagEmoji(country: string): string {
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

const ROUND_LABELS: Record<string, string> = {
  final: 'Final',
  semifinal: 'Halbfinal',
  quarterfinal: 'Viertelfinal',
  'round-of-16': 'Achtelfinale',
  'round-of-32': 'Runde der 32',
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const hasPredicted = usePredictionStore((s) => s.hasPredicted);
  const refreshPredictions = usePredictionStore((s) => s.fetchMyPredictions);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    matchService
      .fetchMatchById(id)
      .then(setMatch)
      .catch(() => setError('Match konnte nicht geladen werden'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handlePredictPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPrediction(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted">Lade Match…</Text>
      </SafeAreaView>
    );
  }

  if (error || !match) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted mb-4">{error ?? 'Match nicht gefunden'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Zurück</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const roundLabel = ROUND_LABELS[match.round.toLowerCase()] ?? match.round;
  const alreadyPredicted = hasPredicted(match.id);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
          {/* Nav */}
          <View className="px-4 pt-2 pb-3 flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3 active:opacity-70">
              <Text className="text-accent text-base">‹ Zurück</Text>
            </Pressable>
          </View>

          {/* Tournament + Round */}
          <View className="px-4 mb-4">
            <Text className="text-muted text-sm">{match.tournament?.name ?? ''}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-primary font-bold text-lg">{roundLabel}</Text>
              {match.status === 'live' && (
                <View className="flex-row items-center gap-1">
                  <LiveIndicator />
                  <Text className="text-accent text-xs font-bold">LIVE</Text>
                </View>
              )}
            </View>
            {match.court && (
              <Text className="text-muted text-xs mt-0.5">{match.court}</Text>
            )}
          </View>

          {/* Score Card */}
          <View className="mx-4 bg-surface rounded-2xl p-5 mb-4">
            {/* Teams */}
            <View className="flex-row items-center justify-between mb-4">
              {/* Team 1 */}
              <View className="flex-1 items-center">
                <Text className="text-3xl mb-1">{flagEmoji(match.team1Player1.country)}</Text>
                <Text className="text-primary font-bold text-sm text-center" numberOfLines={2}>
                  {match.team1Player1.name}
                </Text>
                <Text className="text-muted text-xs text-center" numberOfLines={1}>
                  {match.team1Player2.name}
                </Text>
              </View>

              {/* Score */}
              <View className="items-center px-4">
                {match.score.sets.length > 0 ? (
                  <View className="flex-row gap-3">
                    {match.score.sets.map((s, i) => (
                      <View key={i} className="items-center">
                        <Text className={`text-2xl font-bold ${
                          s.team1 > s.team2 ? 'text-primary' : 'text-muted'
                        }`}>{s.team1}</Text>
                        <Text className={`text-2xl font-bold ${
                          s.team2 > s.team1 ? 'text-primary' : 'text-muted'
                        }`}>{s.team2}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="items-center">
                    {match.status === 'upcoming' ? (
                      <CountdownTimer
                        scheduledAt={match.scheduledAt}
                        className="text-accent font-bold text-sm"
                      />
                    ) : (
                      <Text className="text-muted text-lg font-bold">vs</Text>
                    )}
                    <Text className="text-muted text-xs mt-1">
                      {new Date(match.scheduledAt).toLocaleTimeString('de-CH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>

              {/* Team 2 */}
              <View className="flex-1 items-center">
                <Text className="text-3xl mb-1">{flagEmoji(match.team2Player1.country)}</Text>
                <Text className="text-primary font-bold text-sm text-center" numberOfLines={2}>
                  {match.team2Player1.name}
                </Text>
                <Text className="text-muted text-xs text-center" numberOfLines={1}>
                  {match.team2Player2.name}
                </Text>
              </View>
            </View>

            {/* Winner banner */}
            {match.status === 'completed' && match.winnerTeam && (
              <View className="bg-background rounded-xl px-3 py-2 items-center">
                <Text className="text-accent font-bold text-sm">
                  🏆 Sieger: Team {match.winnerTeam === 1
                    ? `${match.team1Player1.name} / ${match.team1Player2.name}`
                    : `${match.team2Player1.name} / ${match.team2Player2.name}`}
                </Text>
              </View>
            )}
          </View>

          {/* Players */}
          <View className="px-4 mb-4">
            <Text className="text-muted text-xs uppercase tracking-widest mb-3">Spieler</Text>
            <View className="flex-row gap-3">
              {[match.team1Player1, match.team1Player2, match.team2Player1, match.team2Player2].map(
                (p) => (
                  <View key={p.id} className="flex-1 bg-surface rounded-2xl p-3 items-center">
                    <Text className="text-2xl mb-1">{flagEmoji(p.country)}</Text>
                    <Text className="text-primary font-semibold text-xs text-center" numberOfLines={2}>
                      {p.name.split(' ').pop()}
                    </Text>
                    {p.ranking && (
                      <Text className="text-muted text-xs mt-0.5">#{p.ranking}</Text>
                    )}
                  </View>
                ),
              )}
            </View>
          </View>

          {/* Match info */}
          <View className="px-4 mb-6">
            <Text className="text-muted text-xs uppercase tracking-widest mb-3">Match Info</Text>
            <View className="bg-surface rounded-2xl px-4 py-3 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted text-sm">Turnier</Text>
                <Text className="text-primary text-sm font-semibold">
                  {match.tournament?.name ?? '–'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted text-sm">Runde</Text>
                <Text className="text-primary text-sm font-semibold">{roundLabel}</Text>
              </View>
              {match.court && (
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Court</Text>
                  <Text className="text-primary text-sm font-semibold">{match.court}</Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-muted text-sm">Datum</Text>
                <Text className="text-primary text-sm font-semibold">
                  {new Date(match.scheduledAt).toLocaleDateString('de-CH', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              {match.tournament?.surface && (
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Belag</Text>
                  <Text className="text-primary text-sm font-semibold capitalize">
                    {match.tournament.surface}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Predict CTA */}
          {match.status === 'upcoming' && (
            <View className="px-4">
              {alreadyPredicted ? (
                <View className="bg-surface rounded-2xl py-4 items-center">
                  <Text className="text-accent font-bold">✓ Tipp abgegeben</Text>
                </View>
              ) : (
                <Pressable
                  onPress={handlePredictPress}
                  className="bg-accent rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-black font-bold text-base">Tipp abgeben</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        {showPrediction && (
          <PredictionSheet
            match={match}
            onClose={() => {
              setShowPrediction(false);
              refreshPredictions();
            }}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
