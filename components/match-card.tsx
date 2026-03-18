import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LiveIndicator } from './live-indicator';
import type { Match } from '@/types/match';

interface MatchCardProps {
  match: Match;
}

const ROUND_LABELS: Record<string, string> = {
  final: 'F',
  semifinal: 'SF',
  quarterfinal: 'QF',
  'round-of-16': 'R16',
  'round-of-32': 'R32',
};

function formatScore(match: Match): string {
  if (match.score.sets.length === 0) return '';
  return match.score.sets.map((s) => `${s.team1}-${s.team2}`).join('  ');
}

function flagEmoji(country: string): string {
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

export const MatchCard = memo(function MatchCard({ match }: MatchCardProps) {
  const roundLabel = ROUND_LABELS[match.round.toLowerCase()] ?? match.round.toUpperCase();
  const score = formatScore(match);

  return (
    <Pressable
      className="bg-surface rounded-2xl p-4 mb-3 mx-4 active:opacity-80"
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <View className="flex-row justify-between items-start">
        {/* Teams */}
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-base">{flagEmoji(match.team1Player1.country)}</Text>
            <Text className="text-primary font-semibold text-sm" numberOfLines={1}>
              {match.team1Player1.name} / {match.team1Player2.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base">{flagEmoji(match.team2Player1.country)}</Text>
            <Text className="text-primary font-semibold text-sm" numberOfLines={1}>
              {match.team2Player1.name} / {match.team2Player2.name}
            </Text>
          </View>
        </View>

        {/* Score / Status */}
        <View className="items-end">
          {match.status === 'live' && (
            <View className="flex-row items-center gap-1 mb-1">
              <LiveIndicator />
              <Text className="text-accent text-xs font-bold">LIVE</Text>
            </View>
          )}
          {score ? (
            <Text className="text-primary font-bold text-sm">{score}</Text>
          ) : (
            <Text className="text-muted text-xs">
              {new Date(match.scheduledAt).toLocaleTimeString('de-CH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-background">
        <Text className="text-muted text-xs">{match.tournament?.name ?? ''}</Text>
        <View className="bg-secondary px-2 py-0.5 rounded">
          <Text className="text-primary text-xs font-bold">{roundLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
});
