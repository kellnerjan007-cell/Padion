import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isMe?: boolean;
  isLocked?: boolean;
}

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-yellow-500', text: 'text-black' },
  2: { bg: 'bg-gray-400',   text: 'text-black' },
  3: { bg: 'bg-amber-600',  text: 'text-white' },
};

function rankBadge(rank: number | null) {
  if (!rank) return null;
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <View className={`w-8 h-8 rounded-full items-center justify-center ${style.bg}`}>
        <Text className={`text-xs font-bold ${style.text}`}>{rank}</Text>
      </View>
    );
  }
  return (
    <View className="w-8 h-8 items-center justify-center">
      <Text className="text-muted text-sm font-semibold">{rank}</Text>
    </View>
  );
}

function avatarInitial(entry: LeaderboardEntry): string {
  const name = entry.profile?.displayName ?? entry.profile?.username ?? '?';
  return name.charAt(0).toUpperCase();
}

function flagEmoji(country?: string): string {
  if (!country) return '';
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

export const LeaderboardRow = memo(function LeaderboardRow({ entry, isMe, isLocked }: LeaderboardRowProps) {
  if (isLocked) {
    return (
      <View className="flex-row items-center px-4 py-3 opacity-40">
        {rankBadge(entry.rank)}
        <View className="w-9 h-9 rounded-full bg-surface mx-3 items-center justify-center">
          <Text className="text-muted text-xs">🔒</Text>
        </View>
        <View className="flex-1">
          <View className="h-3 w-24 bg-surface rounded" />
        </View>
        <View className="h-3 w-10 bg-surface rounded" />
      </View>
    );
  }

  const accuracy =
    entry.totalPredictions > 0
      ? `${Math.round((entry.correctPredictions / entry.totalPredictions) * 100)}%`
      : '–';

  return (
    <View
      className={`flex-row items-center px-4 py-3 ${
        isMe ? 'bg-accent/10 border-l-2 border-accent' : ''
      }`}
    >
      {rankBadge(entry.rank)}

      {/* Avatar */}
      <View
        className={`w-9 h-9 rounded-full mx-3 items-center justify-center ${
          isMe ? 'bg-accent' : 'bg-surface'
        }`}
      >
        <Text className={`font-bold text-sm ${isMe ? 'text-black' : 'text-primary'}`}>
          {avatarInitial(entry)}
        </Text>
      </View>

      {/* Name + meta */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text className={`font-semibold text-sm ${isMe ? 'text-accent' : 'text-primary'}`}>
            {entry.profile?.displayName ?? entry.profile?.username ?? '–'}
          </Text>
          {entry.profile?.country && (
            <Text className="text-xs">{flagEmoji(entry.profile.country)}</Text>
          )}
        </View>
        <View className="flex-row items-center gap-2 mt-0.5">
          <Text className="text-muted text-xs">{accuracy}</Text>
          {entry.streak > 0 && (
            <Text className="text-xs text-orange-400">{entry.streak}🔥</Text>
          )}
        </View>
      </View>

      {/* Points */}
      <Text className={`font-bold text-base ${isMe ? 'text-accent' : 'text-primary'}`}>
        {entry.totalPoints}
      </Text>
    </View>
  );
});
